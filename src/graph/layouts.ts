/**
 * G6 v5 layout configurations for the two view modes.
 *
 * Overview: ~9 nodes (3 clusters + 6 mechanisms) — gentle d3-force
 * Neighborhood: center node + aggregated neighbors — radial layout
 */

/** Overview mode: gentle force for ~9 nodes, settles fast */
export const overviewLayoutConfig = {
  type: 'd3-force' as const,
  alphaDecay: 0.05,   // fast settle for <10 nodes
  alphaMin: 0.001,
  manyBody: {
    strength: -600,
  },
  link: {
    distance: 200,
    strength: 0.5,
  },
  center: {
    strength: 0.1,
  },
  collide: {
    radius: 80,
    strength: 1.0,
    iterations: 3,
  },
};

/** Neighborhood mode: radial layout centered on the focus node */
export const neighborhoodLayoutConfig = {
  type: 'd3-force' as const,
  alphaDecay: 0.08,   // very fast settle for small neighborhoods
  alphaMin: 0.001,
  manyBody: {
    strength: -400,
  },
  link: {
    distance: 160,
    strength: 0.6,
  },
  center: {
    strength: 0.15,
  },
  collide: {
    radius: 70,
    strength: 1.0,
    iterations: 3,
  },
};
