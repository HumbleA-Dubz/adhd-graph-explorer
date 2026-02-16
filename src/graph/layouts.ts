import { LINK_DISTANCE, NODE_SPACING } from '@/theme/constants';

/**
 * G6 v5 layout configuration.
 * Using d3-force for reliable force-directed layout.
 * combo-combined has a known r.assign bug in G6 v5.0.51.
 *
 * Parameter structure follows @antv/layout D3ForceLayoutOptions:
 * forces are configured as nested objects (manyBody, collide, link, center).
 */
export const layoutConfig = {
  type: 'd3-force' as const,
  // alphaDecay controls how quickly the simulation settles.
  // 0.028 = ~300 iterations (default, too fast), 0.006 = ~1500 (too slow)
  // 0.015 ≈ ~600 iterations, settling in ~10-15 seconds
  alphaDecay: 0.015,
  alphaMin: 0.001,
  // Very strong charge repulsion — 325 edges create massive inward pull,
  // so repulsion must dominate to keep the dense center readable
  manyBody: {
    strength: -4000,
  },
  // Generous collision radius to prevent node + label overlap
  collide: {
    radius: NODE_SPACING,
    strength: 1.0,
    iterations: 4,
  },
  // Weak link force — enough to show structure, not enough to collapse center
  link: {
    distance: LINK_DISTANCE,
    strength: 0.15,   // very weak edge pull (default ~0.5–1.0)
  },
  // Very weak center gravity — just keeps the graph on screen
  center: {
    strength: 0.01,
  },
};
