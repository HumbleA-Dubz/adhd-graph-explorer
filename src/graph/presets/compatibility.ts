import type { GraphData, CompatibilityRating } from '@/pipeline/types';
import type { PresetConfig, EdgeStyleOverride } from './index';
import { RATING_COLORS, DIM_OPACITY } from '@/theme/palette';

/**
 * Compatibility preset: "What works where?"
 *
 * Highlighted edges:
 * - Only edges where edgeType === 'compatibility_rating'
 * - Color by rating: S = green, P = amber, X = red
 * - lineWidth: 2
 *
 * All other edges: dimmed to DIM_OPACITY
 * Nodes: unchanged
 */
export function createCompatibilityPreset(data: GraphData): PresetConfig {
  const edgeStyles = new Map<string, EdgeStyleOverride>();

  for (const edge of data.edges) {
    if (edge.edgeType === 'compatibility_rating') {
      const rating = edge.data.rating as CompatibilityRating | undefined;

      if (rating && (rating === 'S' || rating === 'P' || rating === 'X')) {
        edgeStyles.set(edge.id, {
          stroke: RATING_COLORS[rating],
          lineWidth: 2,
          opacity: 1.0,
        });
      } else {
        // Compatibility edge without valid rating → still highlight but use default color
        edgeStyles.set(edge.id, {
          lineWidth: 2,
          opacity: 1.0,
        });
      }
    } else {
      // Dim all non-compatibility edges
      edgeStyles.set(edge.id, { opacity: DIM_OPACITY });
    }
  }

  return {
    nodeStyles: new Map(),
    edgeStyles,
    description: 'What works where?',
  };
}
