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
  // Let the simulation run longer before settling (lower = more iterations)
  alphaDecay: 0.008,
  alphaMin: 0.001,
  // Strong collision detection to prevent overlap
  collideStrength: 1.0,
  // Strong charge repulsion to spread nodes apart (negative = repel)
  manyBodyStrength: -800,
};
