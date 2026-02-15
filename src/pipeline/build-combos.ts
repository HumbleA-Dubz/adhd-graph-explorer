import type { Entity, CanvasNode, Combo } from './types';
import { extractClusterLetters, clusterLetterToId } from '@/utils/string';

/** IDs of clusters that should NOT become canvas nodes. */
const MAIN_CLUSTER_IDS = new Set(['CL_A', 'CL_B', 'CL_C']);

/**
 * Determine which cluster entities are cross-cluster (not canvas nodes)
 * vs main clusters (become combos).
 */
function isNonCanvasCluster(entity: Entity): boolean {
  // All cluster entities are non-canvas. Main clusters become Combos,
  // cross-cluster entries (CL_AMP, CL_CONV_*, CL_STANDALONE_*) are metadata only.
  return entity.type === 'cluster';
}

/**
 * Assign combo membership to problem nodes based on clusters.yaml.
 *
 * Rules:
 * - Problems in a cluster's members[] get comboId = that cluster's ID
 * - Cross-cluster problems: assign to FIRST cluster letter, store secondary
 * - CL_A: FP03, FP04, FP12, FP08 (4 nodes)
 * - CL_B: FP01, FP11 (2 nodes)
 * - CL_C: FP02, FP06 (2 nodes)
 * - No combo: FP05, FP07, FP09, FP10, FP18 (5 nodes)
 * - Convergence: FP04 (A+C), FP08 (A+B)
 */
export function assignCombos(
  entities: Entity[],
): { canvasNodes: CanvasNode[]; combos: Combo[] } {
  const problems = entities.filter((e) => e.type === 'problem');
  const clusters = entities.filter((e) => e.type === 'cluster');

  // Build cluster membership from each problem's own cluster field
  const problemComboMap = new Map<string, {
    primary: string | undefined;
    secondary: string[];
    isConvergence: boolean;
  }>();

  for (const problem of problems) {
    const d = problem.data as Record<string, unknown>;
    const clusterField = d.cluster as string | undefined;

    if (!clusterField) {
      problemComboMap.set(problem.id, {
        primary: undefined,
        secondary: [],
        isConvergence: false,
      });
      continue;
    }

    const letters = extractClusterLetters(clusterField);

    if (letters.length === 0) {
      // Standalone or cross-cluster amplifier — no combo
      problemComboMap.set(problem.id, {
        primary: undefined,
        secondary: [],
        isConvergence: false,
      });
    } else if (letters.length === 1) {
      // Single cluster membership
      problemComboMap.set(problem.id, {
        primary: clusterLetterToId(letters[0]!),
        secondary: [],
        isConvergence: false,
      });
    } else {
      // Multi-cluster (convergence point)
      const primary = clusterLetterToId(letters[0]!);
      const secondary = letters.slice(1).map(clusterLetterToId);
      problemComboMap.set(problem.id, {
        primary,
        secondary,
        isConvergence: true,
      });
    }
  }

  // Build canvas nodes from all non-cluster entities
  const canvasNodes: CanvasNode[] = [];

  for (const entity of entities) {
    if (isNonCanvasCluster(entity)) continue;
    if (entity.type === 'claim' || entity.type === 'source') continue;

    const node: CanvasNode = {
      ...entity,
      type: entity.type as CanvasNode['type'],
    };

    // Apply combo info for problems
    if (entity.type === 'problem') {
      const combo = problemComboMap.get(entity.id);
      if (combo) {
        node.comboId = combo.primary;
        if (combo.isConvergence) {
          node.isConvergencePoint = true;
          node.secondaryClusters = combo.secondary;
        }
      }
    }

    canvasNodes.push(node);
  }

  // Build Combo objects for main clusters only
  const combos: Combo[] = [];
  for (const cl of clusters) {
    if (MAIN_CLUSTER_IDS.has(cl.id)) {
      combos.push({
        id: cl.id,
        label: cl.label,
        data: cl.data,
      });
    }
  }

  return { canvasNodes, combos };
}
