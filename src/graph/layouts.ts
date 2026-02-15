import { LINK_DISTANCE, NODE_SPACING } from '@/theme/constants';

/**
 * G6 v5 layout configuration.
 * Using d3-force for reliable force-directed layout.
 * combo-combined has a known r.assign bug in G6 v5.0.51.
 */
export const layoutConfig = {
  type: 'd3-force' as const,
  preventOverlap: true,
  nodeSize: 50,
  nodeSpacing: NODE_SPACING,
  linkDistance: LINK_DISTANCE,
  forceSimulation: null,
  alphaDecay: 0.028,
  alphaMin: 0.001,
  collideStrength: 0.8,
};
