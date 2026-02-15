import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { GraphEdge, CompatibilityRating, VulnerabilityRating } from './types';
import { EntityLookup } from './entity-lookup';

interface CompatibilityData {
  meta_challenge_vulnerability?: Record<string, Record<string, string>>;
  [clusterOrProblem: string]: unknown;
}

/**
 * Parse the compatibility.yaml matrix into typed edges.
 *
 * Two sections:
 * 1. Problem-Model compatibility: cluster/problem display names -> model display names -> S/P/X
 * 2. Meta-challenge vulnerability: model display names -> challenge display names -> H/M/L
 */
export function parseCompatibilityMatrix(
  yamlDir: string,
  lookup: EntityLookup,
): GraphEdge[] {
  const raw = readFileSync(join(yamlDir, 'compatibility.yaml'), 'utf-8');
  const data = parseYaml(raw) as CompatibilityData;
  const edges: GraphEdge[] = [];
  let edgeIdx = 0;

  for (const [key, value] of Object.entries(data)) {
    if (key === 'meta_challenge_vulnerability') {
      // Section 2: model -> challenge -> H/M/L
      const vulnMap = value as Record<string, Record<string, string>>;
      for (const [modelName, challenges] of Object.entries(vulnMap)) {
        const modelId = lookup.resolve(modelName, {
          sourceEntity: 'compatibility',
          field: 'meta_challenge_vulnerability',
        });
        if (!modelId) continue;

        for (const [challengeName, rating] of Object.entries(challenges)) {
          if (challengeName === 'summary') continue; // Skip summary field

          const challengeId = lookup.resolve(challengeName, {
            sourceEntity: 'compatibility',
            field: `meta_challenge_vulnerability.${modelName}`,
          });
          if (!challengeId) continue;

          edges.push({
            id: `compat_vuln_${edgeIdx++}`,
            source: modelId,
            target: challengeId,
            edgeType: 'vulnerability_rating',
            data: {
              rating: rating as VulnerabilityRating,
              label: `${rating} vulnerability`,
            },
          });
        }
      }
    } else {
      // Section 1: cluster/problem -> model -> S/P/X
      const ratings = value as Record<string, string>;
      const sourceId = lookup.resolve(key, {
        sourceEntity: 'compatibility',
        field: 'problem_model_compatibility',
      });
      if (!sourceId) continue;

      for (const [modelName, rating] of Object.entries(ratings)) {
        const modelId = lookup.resolve(modelName, {
          sourceEntity: 'compatibility',
          field: `compatibility.${key}`,
        });
        if (!modelId) continue;

        edges.push({
          id: `compat_${edgeIdx++}`,
          source: sourceId,
          target: modelId,
          edgeType: 'compatibility_rating',
          data: {
            rating: rating as CompatibilityRating,
            label: `${rating} compatibility`,
          },
        });
      }
    }
  }

  return edges;
}
