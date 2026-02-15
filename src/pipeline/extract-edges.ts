import type { GraphEdge } from './types';
import type { ParsedEntities } from './parse-entities';
import type { EntityLookup } from './entity-lookup';
import { extractClusterLetters, clusterLetterToId } from '@/utils/string';

/**
 * Extract all cross-reference edges from parsed entities.
 *
 * Each extraction function handles one YAML file's references and returns
 * typed directed edges. The EntityLookup resolves free-text names to IDs.
 */
export function extractAllEdges(
  parsed: ParsedEntities,
  lookup: EntityLookup,
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  let idx = 0;

  function addEdge(
    source: string,
    target: string,
    edgeType: string,
    data: GraphEdge['data'] = {},
  ): void {
    edges.push({
      id: `e_${edgeType}_${idx++}`,
      source,
      target,
      edgeType,
      data,
    });
  }

  function resolveAndAdd(
    ref: string,
    sourceId: string,
    edgeType: string,
    field: string,
    data: GraphEdge['data'] = {},
  ): void {
    const targetId = lookup.resolve(ref, { sourceEntity: sourceId, field });
    if (targetId) {
      addEdge(sourceId, targetId, edgeType, data);
    }
  }

  // ── problems.yaml ─────────────────────────────────────────

  for (const p of parsed.problems) {
    const d = p.data as Record<string, unknown>;

    // problem -> mechanism
    const mechanisms = (d.mechanisms ?? []) as string[];
    for (const mech of mechanisms) {
      resolveAndAdd(mech, p.id, 'problem_mechanism', 'mechanisms');
    }

    // problem -> claim
    const claims = (d.claims ?? []) as string[];
    for (const c of claims) {
      resolveAndAdd(c, p.id, 'problem_claim', 'claims');
    }

    // problem -> cluster
    const cluster = d.cluster as string | undefined;
    if (cluster) {
      const letters = extractClusterLetters(cluster);
      for (const letter of letters) {
        const clusterId = clusterLetterToId(letter);
        if (lookup.has(clusterId)) {
          addEdge(p.id, clusterId, 'problem_cluster');
        }
      }
    }
  }

  // ── mechanisms.yaml ───────────────────────────────────────

  for (const m of parsed.mechanisms) {
    const d = m.data as Record<string, unknown>;

    // mechanism -> problem (affects_problems)
    const affectsProblems = (d.affects_problems ?? []) as string[];
    for (const ref of affectsProblems) {
      // Strip annotations like "(primary)", "(partially — ...)"
      resolveAndAdd(ref, m.id, 'mechanism_problem', 'affects_problems');
    }

    // mechanism -> model (favours)
    const favoursModels = (d.favours_models ?? []) as string[];
    for (const ref of favoursModels) {
      resolveAndAdd(ref, m.id, 'mechanism_model_favours', 'favours_models', {
        subType: 'favours',
      });
    }

    // mechanism -> model (disfavours)
    const disfavoursModels = (d.disfavours_models ?? []) as string[];
    for (const ref of disfavoursModels) {
      resolveAndAdd(ref, m.id, 'mechanism_model_disfavours', 'disfavours_models', {
        subType: 'disfavours',
      });
    }

    // mechanism -> meta challenge (underlies_challenges)
    const underliesChallenges = (d.underlies_challenges ?? []) as string[];
    for (const ref of underliesChallenges) {
      resolveAndAdd(ref, m.id, 'mechanism_meta_challenge', 'underlies_challenges');
    }
  }

  // ── clusters.yaml ─────────────────────────────────────────

  // Cross-cluster entries (CL_AMP, CL_CONV_*, CL_STANDALONE_*) are NOT canvas
  // nodes. Their edges must be remapped to the problem ID they represent.
  // e.g. CL_AMP references FP05, so edges from CL_AMP become edges from FP05.
  function resolveCrossClusterProblemId(
    clusterEntity: { id: string; data: Record<string, unknown> },
  ): string | undefined {
    const problemRef = clusterEntity.data.problem as string | undefined;
    if (!problemRef) return undefined;
    return lookup.resolve(problemRef, {
      sourceEntity: clusterEntity.id,
      field: 'problem',
    });
  }

  const MAIN_CLUSTER_IDS = new Set(['CL_A', 'CL_B', 'CL_C']);

  for (const cl of parsed.clusters) {
    const d = cl.data as Record<string, unknown>;
    const isMainCluster = MAIN_CLUSTER_IDS.has(cl.id);

    if (isMainCluster) {
      // Main clusters: process members, mechanism, claims normally
      const members = d.members as Array<Record<string, unknown>> | undefined;
      if (members && Array.isArray(members)) {
        for (const member of members) {
          const problemRef = member.problem as string;
          if (problemRef) {
            resolveAndAdd(problemRef, cl.id, 'cluster_problem', 'members[].problem');
          }
        }
      }

      const primaryMechanism = d.primary_mechanism as string | undefined;
      if (primaryMechanism) {
        resolveAndAdd(primaryMechanism, cl.id, 'cluster_mechanism', 'primary_mechanism');
      }

      const claims = (d.claims ?? []) as string[];
      for (const c of claims) {
        resolveAndAdd(c, cl.id, 'cluster_claim', 'claims');
      }
    } else {
      // Cross-cluster entry: remap source to the problem it represents
      const problemId = resolveCrossClusterProblemId({ id: cl.id, data: d });
      if (!problemId) continue; // standalone entries with no resolvable problem

      // Cross-cluster claims: remap source from CL_AMP -> FP05 etc.
      const claims = (d.claims ?? []) as string[];
      for (const c of claims) {
        resolveAndAdd(c, problemId, 'problem_claim', 'claims');
      }

      // Amplifier affects: "FP05 amplifies CL_A, CL_B, CL_C"
      const affects = d.affects as string[] | undefined;
      if (affects && Array.isArray(affects)) {
        for (const ref of affects) {
          resolveAndAdd(ref, problemId, 'problem_amplifies_cluster', 'affects');
        }
      }

      // Convergence receives_from: "FP04 receives from CL_A, CL_C"
      const receivesFrom = d.receives_from as string[] | undefined;
      if (receivesFrom && Array.isArray(receivesFrom)) {
        for (const ref of receivesFrom) {
          // Edge direction: cluster -> problem (cluster feeds into problem)
          const clusterId = lookup.resolve(ref, {
            sourceEntity: cl.id,
            field: 'receives_from',
          });
          if (clusterId) {
            addEdge(clusterId, problemId, 'cluster_feeds_problem');
          }
        }
      }
    }
  }

  // ── meta_challenges.yaml ──────────────────────────────────

  for (const mc of parsed.metaChallenges) {
    const d = mc.data as Record<string, unknown>;

    // meta_challenge -> cluster (clusters_affected are letters like "A", "B")
    const clustersAffected = (d.clusters_affected ?? []) as string[];
    for (const ref of clustersAffected) {
      const clusterId = clusterLetterToId(ref);
      if (lookup.has(clusterId)) {
        addEdge(mc.id, clusterId, 'meta_challenge_cluster');
      }
    }

    // meta_challenge -> model (favours)
    const favoursModels = (d.favours_models ?? []) as string[];
    for (const ref of favoursModels) {
      resolveAndAdd(ref, mc.id, 'meta_challenge_model_favours', 'favours_models', {
        subType: 'favours',
      });
    }

    // meta_challenge -> model (disfavours)
    const disfavoursModels = (d.disfavours_models ?? []) as string[];
    for (const ref of disfavoursModels) {
      resolveAndAdd(ref, mc.id, 'meta_challenge_model_disfavours', 'disfavours_models', {
        subType: 'disfavours',
      });
    }

    // meta_challenge -> claim
    const claims = (d.claims ?? []) as string[];
    for (const c of claims) {
      resolveAndAdd(c, mc.id, 'meta_challenge_claim', 'claims');
    }

    // meta_challenge -> meta_challenge (compound_effects.amplifies)
    const compound = d.compound_effects as Record<string, unknown> | undefined;
    if (compound) {
      const amplifies = (compound.amplifies ?? []) as string[];
      for (const ref of amplifies) {
        resolveAndAdd(ref, mc.id, 'meta_challenge_amplifies', 'compound_effects.amplifies');
      }
    }
  }

  // ── engagement_models.yaml ────────────────────────────────

  for (const em of parsed.engagementModels) {
    const d = em.data as Record<string, unknown>;

    // model -> claim
    const claims = (d.claims ?? []) as string[];
    for (const c of claims) {
      resolveAndAdd(c, em.id, 'model_claim', 'claims');
    }

    // model -> problem (primary)
    const primaryProblems = (d.primary_problems ?? []) as string[];
    for (const ref of primaryProblems) {
      resolveAndAdd(ref, em.id, 'model_problem_primary', 'primary_problems', {
        subType: 'primary',
      });
    }

    // model -> problem (secondary)
    const secondaryProblems = (d.secondary_problems ?? []) as string[];
    for (const ref of secondaryProblems) {
      resolveAndAdd(ref, em.id, 'model_problem_secondary', 'secondary_problems', {
        subType: 'secondary',
      });
    }

    // model -> meta_challenge (meta_challenge_vulnerability keys like MC1_novelty_decay)
    const mcVuln = d.meta_challenge_vulnerability as Record<string, string> | undefined;
    if (mcVuln) {
      for (const [key, _desc] of Object.entries(mcVuln)) {
        // Keys are like "MC1_novelty_decay" — extract the ID prefix (MC1, MC2, etc.)
        const mcIdMatch = key.match(/^(MC\d+)/);
        if (mcIdMatch) {
          const mcId = mcIdMatch[1]!;
          if (lookup.has(mcId)) {
            addEdge(em.id, mcId, 'model_meta_vulnerability');
          }
        }
      }
    }
  }

  // ── foundations.yaml ──────────────────────────────────────

  for (const f of parsed.foundations) {
    const d = f.data as Record<string, unknown>;

    // foundation -> model (required_by.required)
    const requiredBy = d.required_by as Record<string, unknown> | undefined;
    if (requiredBy) {
      const required = (requiredBy.required ?? []) as string[];
      for (const ref of required) {
        resolveAndAdd(ref, f.id, 'foundation_model_required', 'required_by.required', {
          subType: 'required',
        });
      }

      const optional = (requiredBy.optional ?? []) as string[];
      for (const ref of optional) {
        resolveAndAdd(ref, f.id, 'foundation_model_optional', 'required_by.optional', {
          subType: 'optional',
        });
      }
    }

    // foundation -> technology (technology_ref)
    const techRef = d.technology_ref as string | undefined;
    if (techRef) {
      resolveAndAdd(techRef, f.id, 'foundation_technology', 'technology_ref');
    }
  }

  // ── technologies.yaml ─────────────────────────────────────

  for (const t of parsed.technologies) {
    const d = t.data as Record<string, unknown>;

    // technology -> foundation (serves_foundations)
    const servesFoundations = (d.serves_foundations ?? []) as string[];
    for (const ref of servesFoundations) {
      resolveAndAdd(ref, t.id, 'technology_foundation', 'serves_foundations');
    }

    // technology -> model (needed_by_models.required)
    const neededByModels = d.needed_by_models as Record<string, unknown> | undefined;
    if (neededByModels) {
      const required = (neededByModels.required ?? []) as string[];
      for (const ref of required) {
        resolveAndAdd(ref, t.id, 'technology_model_required', 'needed_by_models.required', {
          subType: 'required',
        });
      }

      const optional = (neededByModels.optional ?? []) as string[];
      for (const ref of optional) {
        resolveAndAdd(ref, t.id, 'technology_model_optional', 'needed_by_models.optional', {
          subType: 'optional',
        });
      }
    }

    // technology -> claim (relevant_claims)
    const relevantClaims = (d.relevant_claims ?? []) as string[];
    for (const ref of relevantClaims) {
      resolveAndAdd(ref, t.id, 'technology_claim', 'relevant_claims');
    }
  }

  // ── claims.yaml ───────────────────────────────────────────

  for (const c of parsed.claims) {
    const d = c.data as Record<string, unknown>;

    // claim -> source
    const sources = (d.sources ?? []) as string[];
    for (const ref of sources) {
      resolveAndAdd(ref, c.id, 'claim_source', 'sources');
    }

    // claim relationships
    const relationships = d.relationships as Record<string, unknown> | undefined;
    if (relationships) {
      // claim -> various (supports)
      const supports = (relationships.supports ?? []) as string[];
      for (const ref of supports) {
        resolveAndAdd(ref, c.id, 'claim_supports', 'relationships.supports');
      }

      // claim -> claim (challenged_by)
      const challengedBy = (relationships.challenged_by ?? []) as string[];
      for (const ref of challengedBy) {
        resolveAndAdd(ref, c.id, 'claim_challenged_by', 'relationships.challenged_by');
      }

      // claim -> claim (depends_on)
      const dependsOn = (relationships.depends_on ?? []) as string[];
      for (const ref of dependsOn) {
        resolveAndAdd(ref, c.id, 'claim_depends_on', 'relationships.depends_on');
      }
    }
  }

  // ── implications.yaml ─────────────────────────────────────

  for (const imp of parsed.implications) {
    const d = imp.data as Record<string, unknown>;

    // implication -> claim (evidence)
    const evidence = (d.evidence ?? []) as string[];
    for (const ref of evidence) {
      resolveAndAdd(ref, imp.id, 'implication_claim', 'evidence');
    }
  }

  return edges;
}
