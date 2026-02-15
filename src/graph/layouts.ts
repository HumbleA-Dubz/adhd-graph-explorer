import { COMBO_PADDING, LINK_DISTANCE, NODE_SPACING } from '@/theme/constants';

/**
 * G6 v5 combo-combined layout configuration.
 * Uses ComboCombined: inner concentric for combo members,
 * outer d3-force for everything else.
 *
 * Note: G6 v5 `force` layout uses a custom API; `d3-force` uses the
 * standard d3-force-simulation and is more reliable for combo-combined.
 */
export const layoutConfig = {
  type: 'combo-combined' as const,
  comboPadding: COMBO_PADDING,
  spacing: NODE_SPACING,
  innerLayout: {
    type: 'concentric' as const,
    preventOverlap: true,
    nodeSize: 50,
  },
  outerLayout: {
    type: 'd3-force' as const,
    preventOverlap: true,
    nodeSize: 50,
    linkDistance: LINK_DISTANCE,
  },
};
