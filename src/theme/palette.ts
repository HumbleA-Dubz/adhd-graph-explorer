import type { CanvasEntityType } from '@/pipeline/types';

/** IBM Design Language accessible palette — colorblind-friendly */
export const TYPE_COLORS: Record<CanvasEntityType, string> = {
  problem: '#6929C4',          // Purple 60
  mechanism: '#1192E8',        // Cyan 50
  engagement_model: '#005D5D', // Teal 70
  meta_challenge: '#9F1853',   // Magenta 70
  foundation: '#FA4D56',       // Red 50
  technology: '#570408',       // Red 90
  implication: '#198038',      // Green 60
};

/** Human-readable labels for entity types */
export const TYPE_LABELS: Record<CanvasEntityType, string> = {
  problem: 'Problem',
  mechanism: 'Mechanism',
  engagement_model: 'Engagement Model',
  meta_challenge: 'Meta Challenge',
  foundation: 'Foundation',
  technology: 'Technology',
  implication: 'Implication',
};

/** Encoding preset scale colors */
export const EVIDENCE_SCALE = {
  strong: '#001D6C',   // Tier 1.0 — darkest blue
  weak: '#BAE6FF',     // Tier 3.3 — lightest blue
  noData: '#E0E0E0',   // Grey for missing data
} as const;

export const RATING_COLORS = {
  S: '#24A148',  // Green — strongly compatible
  P: '#F1C21B',  // Amber — partially compatible
  X: '#DA1E28',  // Red — incompatible
  H: '#DA1E28',  // Red — high vulnerability
  M: '#F1C21B',  // Amber — moderate vulnerability
  L: '#24A148',  // Green — low vulnerability
} as const;

export const EDGE_DEFAULT_COLOR = '#C6C6C6';
export const DIM_OPACITY = 0.1;
export const HIGHLIGHT_OPACITY = 1.0;
