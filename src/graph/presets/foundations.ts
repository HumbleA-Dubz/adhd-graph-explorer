import type { GraphData } from '@/pipeline/types';
import type { PresetConfig, NodeStyleOverride, EdgeStyleOverride } from './index';
import { DIM_OPACITY } from '@/theme/palette';

/**
 * Foundations preset: "What do we need to build?"
 *
 * Highlighted nodes:
 * - foundation and technology entity types → opacity 1.0, slightly enlarged (1.2x)
 *
 * Highlighted edges:
 * - Edges connecting foundations/technologies to engagement models
 * - Required edges (edgeType containing 'required'): solid line, lineWidth 2
 * - Optional edges (edgeType containing 'optional'): dashed line [6, 4], lineWidth 2
 *
 * All other edges: dimmed to DIM_OPACITY
 * Other nodes: slightly dimmed (opacity 0.4)
 */
export function createFoundationsPreset(data: GraphData): PresetConfig {
  const nodeStyles = new Map<string, NodeStyleOverride>();
  const edgeStyles = new Map<string, EdgeStyleOverride>();

  const DEFAULT_NODE_SIZE = 30;

  // Highlight foundation and technology nodes
  for (const node of data.canvasNodes) {
    if (node.type === 'foundation' || node.type === 'technology') {
      nodeStyles.set(node.id, {
        opacity: 1.0,
        size: DEFAULT_NODE_SIZE * 1.2,
      });
    } else {
      // Dim all other nodes
      nodeStyles.set(node.id, { opacity: 0.4 });
    }
  }

  // Highlight foundation/technology edges
  const foundationEdgeTypes = [
    'foundation_model_required',
    'foundation_model_optional',
    'foundation_technology',
    'technology_foundation',
    'technology_model_required',
    'technology_model_optional',
  ];

  for (const edge of data.edges) {
    if (foundationEdgeTypes.some(type => edge.edgeType.includes(type))) {
      // Check if required or optional
      const isRequired = edge.edgeType.includes('required') || edge.data.subType === 'required';
      const isOptional = edge.edgeType.includes('optional') || edge.data.subType === 'optional';

      if (isRequired) {
        edgeStyles.set(edge.id, {
          lineWidth: 2,
          opacity: 1.0,
        });
      } else if (isOptional) {
        edgeStyles.set(edge.id, {
          lineWidth: 2,
          opacity: 1.0,
          lineDash: [6, 4],
        });
      } else {
        // Foundation edge but not explicitly required/optional
        edgeStyles.set(edge.id, {
          lineWidth: 2,
          opacity: 1.0,
        });
      }
    } else {
      // Dim all other edges
      edgeStyles.set(edge.id, { opacity: DIM_OPACITY });
    }
  }

  return {
    nodeStyles,
    edgeStyles,
    description: 'What do we need to build?',
  };
}
