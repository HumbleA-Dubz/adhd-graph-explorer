import type { CanvasEntityType } from '@/pipeline/types';

/** Default node sizes per entity type */
export const NODE_SIZES: Record<CanvasEntityType, number | [number, number]> = {
  problem: 40,
  mechanism: 50,
  engagement_model: [50, 35],
  meta_challenge: 45,
  foundation: 40,
  technology: 35,
  implication: [40, 30],
};

/** G6 shape type per entity type */
export const NODE_SHAPES: Record<CanvasEntityType, string> = {
  problem: 'circle',
  mechanism: 'diamond',
  engagement_model: 'rect',
  meta_challenge: 'hexagon',
  foundation: 'triangle',
  technology: 'star',
  implication: 'ellipse',
};

/** Animation timing */
export const TRANSITION_DURATION = 300;
export const TRANSITION_EASING = 'ease-in-out';

/** Layout */
export const COMBO_PADDING = 30;
export const LINK_DISTANCE = 150;
export const NODE_SPACING = 20;
