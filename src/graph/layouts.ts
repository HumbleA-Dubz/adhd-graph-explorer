import { COMBO_PADDING, LINK_DISTANCE, NODE_SPACING } from '@/theme/constants';

/** G6 v5 combo-combined layout configuration */
export const layoutConfig = {
  type: 'combo-combined' as const,
  comboPadding: COMBO_PADDING,
  spacing: NODE_SPACING,
  innerLayout: {
    type: 'concentric' as const,
    sortBy: 'id',
    preventOverlap: true,
    nodeSize: 50,
  },
  outerLayout: {
    type: 'force' as const,
    preventOverlap: true,
    nodeSpacing: NODE_SPACING,
    linkDistance: LINK_DISTANCE,
    gravity: 0.1,
    maxSpeed: 200,
    damping: 0.9,
  },
};
