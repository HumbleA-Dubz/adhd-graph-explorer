// ── Entity types ────────────────────────────────────────────────
export type EntityType =
  | 'problem'
  | 'mechanism'
  | 'cluster'
  | 'meta_challenge'
  | 'engagement_model'
  | 'foundation'
  | 'technology'
  | 'claim'
  | 'source'
  | 'implication';

/** Types that appear as nodes on the canvas (claims, sources, clusters are off-canvas) */
export type CanvasEntityType = Exclude<EntityType, 'claim' | 'source' | 'cluster'>;

export const CANVAS_ENTITY_TYPES: readonly CanvasEntityType[] = [
  'problem',
  'mechanism',
  'engagement_model',
  'meta_challenge',
  'foundation',
  'technology',
  'implication',
] as const;

// ── Entity ─────────────────────────────────────────────────────
export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  yamlKey: string;
  data: Record<string, unknown>;
}

export interface CanvasNode extends Entity {
  type: CanvasEntityType;
  comboId?: string;
  isConvergencePoint?: boolean;
  secondaryClusters?: string[];
}

// ── Edge ───────────────────────────────────────────────────────
export type CompatibilityRating = 'S' | 'P' | 'X';
export type VulnerabilityRating = 'H' | 'M' | 'L';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  edgeType: string;
  data: {
    label?: string;
    rating?: CompatibilityRating | VulnerabilityRating;
    annotation?: string;
    subType?: 'required' | 'optional' | 'primary' | 'secondary' | 'favours' | 'disfavours';
  };
}

// ── Combo ──────────────────────────────────────────────────────
export interface Combo {
  id: string;
  label: string;
  data: Record<string, unknown>;
}

// ── Full graph ─────────────────────────────────────────────────
export interface GraphData {
  canvasNodes: CanvasNode[];
  offCanvasEntities: Entity[];   // claims + sources (shown in detail panels)
  edges: GraphEdge[];
  combos: Combo[];
}

// ── Pipeline warnings ──────────────────────────────────────────
export interface PipelineWarning {
  sourceEntity: string;
  field: string;
  unresolvedValue: string;
  message: string;
}
