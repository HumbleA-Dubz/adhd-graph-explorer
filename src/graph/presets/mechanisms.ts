import type { GraphData } from '@/pipeline/types';
import type { PresetConfig, NodeStyleOverride, EdgeStyleOverride } from './index';
import { DIM_OPACITY } from '@/theme/palette';

/**
 * Mechanisms preset: "What shares mechanisms?"
 *
 * Highlighted:
 * - All mechanism nodes (enlarged 1.5x from default)
 * - All edges with edgeType containing 'mechanism'
 *
 * Dimmed:
 * - Non-mechanism edges → DIM_OPACITY (0.1)
 * - Non-mechanism nodes → opacity 0.4
 */
export function createMechanismsPreset(data: GraphData): PresetConfig {
  const nodeStyles = new Map<string, NodeStyleOverride>();
  const edgeStyles = new Map<string, EdgeStyleOverride>();

  // Default node size (assuming 30px radius as baseline)
  const DEFAULT_NODE_SIZE = 30;

  // Highlight mechanism nodes
  for (const node of data.canvasNodes) {
    if (node.type === 'mechanism') {
      nodeStyles.set(node.id, {
        size: DEFAULT_NODE_SIZE * 1.5,
        opacity: 1.0,
      });
    } else {
      // Dim all non-mechanism nodes
      nodeStyles.set(node.id, { opacity: 0.4 });
    }
  }

  // Highlight mechanism edges, dim others
  const mechanismEdgeTypes = [
    'problem_mechanism',
    'mechanism_problem',
    'mechanism_model_favours',
    'mechanism_model_disfavours',
    'mechanism_meta_challenge',
    'cluster_mechanism',
  ];

  for (const edge of data.edges) {
    if (mechanismEdgeTypes.some(type => edge.edgeType.includes(type))) {
      // Mechanism-related edges: full opacity
      edgeStyles.set(edge.id, { opacity: 1.0 });
    } else {
      // Dim all other edges
      edgeStyles.set(edge.id, { opacity: DIM_OPACITY });
    }
  }

  return {
    nodeStyles,
    edgeStyles,
    description: 'What shares mechanisms?',
  };
}
