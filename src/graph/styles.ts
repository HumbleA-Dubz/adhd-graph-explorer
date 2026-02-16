import type { CanvasEntityType } from '@/pipeline/types';
import { TYPE_COLORS, EDGE_DEFAULT_COLOR, DIM_OPACITY } from '@/theme/palette';
import { NODE_SIZES, NODE_SHAPES } from '@/theme/constants';

/** Truncate a label string for display on the canvas */
function truncateLabel(text: string, maxLen = 25): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}

// ── Shared state configs ───────────────────────────────────────────

const sharedNodeStates = {
  highlight: {
    lineWidth: 3,
    shadowBlur: 12,
    shadowColor: 'rgba(15, 98, 254, 0.4)',
  },
  dim: {
    opacity: DIM_OPACITY,
  },
  filtered: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  selected: {
    lineWidth: 3,
    stroke: '#0f62fe',
    shadowBlur: 10,
    shadowColor: 'rgba(15, 98, 254, 0.5)',
  },
};

// ── Standard node style (used in full-graph legacy mode) ───────────

/** G6 v5 node style configuration object */
export const nodeStyleConfig = {
  type: (d: Record<string, unknown>) => {
    const data = d.data as Record<string, unknown> | undefined;
    const entityType = data?.entityType as CanvasEntityType | undefined;
    return entityType ? NODE_SHAPES[entityType] : 'circle';
  },
  style: {
    size: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const entityType = data?.entityType as CanvasEntityType | undefined;
      return entityType ? NODE_SIZES[entityType] : 30;
    },
    fill: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const entityType = data?.entityType as CanvasEntityType | undefined;
      return entityType ? TYPE_COLORS[entityType] : '#8d8d8d';
    },
    stroke: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      const entityType = data?.entityType as CanvasEntityType | undefined;
      if (isConvergence && entityType) {
        return TYPE_COLORS[entityType];
      }
      return '#ffffff';
    },
    lineWidth: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      return isConvergence ? 4 : 2;
    },
    shadowColor: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      if (isConvergence) {
        const entityType = data?.entityType as CanvasEntityType | undefined;
        return entityType ? TYPE_COLORS[entityType] : 'transparent';
      }
      return 'transparent';
    },
    shadowBlur: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      return isConvergence ? 8 : 0;
    },
    labelText: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const label = data?.label as string | undefined;
      return truncateLabel(label ?? (d.id as string));
    },
    labelPlacement: 'bottom' as const,
    labelFontSize: 11,
    labelFill: '#393939',
    labelMaxWidth: 120,
    cursor: 'pointer' as const,
  },
  state: sharedNodeStates,
};

// ── Overview node style (clusters + mechanisms) ────────────────────

/** Cluster nodes are displayed as large rounded rectangles */
export const overviewNodeStyleConfig = {
  type: (d: Record<string, unknown>) => {
    const data = d.data as Record<string, unknown> | undefined;
    const isCluster = data?.isClusterNode as boolean | undefined;
    if (isCluster) return 'rect';
    const entityType = data?.entityType as CanvasEntityType | undefined;
    return entityType ? NODE_SHAPES[entityType] : 'circle';
  },
  style: {
    size: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      if (isCluster) return [140, 60];
      const entityType = data?.entityType as CanvasEntityType | undefined;
      return entityType ? NODE_SIZES[entityType] : 30;
    },
    fill: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      if (isCluster) return '#6929C4';
      const entityType = data?.entityType as CanvasEntityType | undefined;
      return entityType ? (TYPE_COLORS[entityType] ?? '#8d8d8d') : '#8d8d8d';
    },
    stroke: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      if (isCluster) return '#491d8b';
      return '#ffffff';
    },
    lineWidth: 2,
    radius: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 12 : 0;
    },
    fillOpacity: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 0.9 : 1.0;
    },
    labelText: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      const label = data?.label as string | undefined;
      if (isCluster) {
        const count = data?.memberCount as number | undefined;
        return `${label ?? d.id}\n${count ?? '?'} problems`;
      }
      return truncateLabel(label ?? (d.id as string));
    },
    labelPlacement: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 'center' : 'bottom';
    },
    labelFontSize: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 12 : 11;
    },
    labelFill: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? '#ffffff' : '#393939';
    },
    labelFontWeight: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 600 : 400;
    },
    labelMaxWidth: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCluster = data?.isClusterNode as boolean | undefined;
      return isCluster ? 130 : 120;
    },
    cursor: 'pointer' as const,
  },
  state: sharedNodeStates,
};

// ── Aggregate-aware node style (neighborhood mode) ─────────────────

/** Handles both real nodes and aggregate nodes in neighborhood mode */
export const aggregateNodeStyleConfig = {
  type: (d: Record<string, unknown>) => {
    const data = d.data as Record<string, unknown> | undefined;
    const isAggregate = data?.isAggregate as boolean | undefined;
    if (isAggregate) {
      const aggType = data?.aggregateType as CanvasEntityType | undefined;
      return aggType ? NODE_SHAPES[aggType] : 'circle';
    }
    const entityType = data?.entityType as CanvasEntityType | undefined;
    return entityType ? NODE_SHAPES[entityType] : 'circle';
  },
  style: {
    size: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      const isCenter = data?.isCenter as boolean | undefined;

      if (isAggregate) {
        const aggType = data?.aggregateType as CanvasEntityType | undefined;
        const baseSize = aggType ? NODE_SIZES[aggType] : 30;
        if (Array.isArray(baseSize)) return [baseSize[0] * 1.5, baseSize[1] * 1.5];
        return (baseSize as number) * 1.5;
      }

      const entityType = data?.entityType as CanvasEntityType | undefined;
      const baseSize = entityType ? NODE_SIZES[entityType] : 30;
      if (isCenter) {
        if (Array.isArray(baseSize)) return [baseSize[0] * 1.8, baseSize[1] * 1.8];
        return (baseSize as number) * 1.8;
      }
      return baseSize;
    },
    fill: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      if (isAggregate) {
        const aggType = data?.aggregateType as CanvasEntityType | undefined;
        return aggType ? (TYPE_COLORS[aggType] ?? '#8d8d8d') : '#8d8d8d';
      }
      const entityType = data?.entityType as CanvasEntityType | undefined;
      return entityType ? (TYPE_COLORS[entityType] ?? '#8d8d8d') : '#8d8d8d';
    },
    fillOpacity: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      return isAggregate ? 0.6 : 1.0;
    },
    stroke: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      const isCenter = data?.isCenter as boolean | undefined;
      if (isCenter) return '#0f62fe';
      if (isAggregate) {
        const aggType = data?.aggregateType as CanvasEntityType | undefined;
        return aggType ? (TYPE_COLORS[aggType] ?? '#8d8d8d') : '#8d8d8d';
      }
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      const entityType = data?.entityType as CanvasEntityType | undefined;
      if (isConvergence && entityType) return TYPE_COLORS[entityType];
      return '#ffffff';
    },
    lineWidth: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      const isCenter = data?.isCenter as boolean | undefined;
      if (isCenter) return 4;
      if (isAggregate) return 2;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      return isConvergence ? 4 : 2;
    },
    lineDash: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      return isAggregate ? [6, 4] : [0, 0];
    },
    shadowColor: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      if (isConvergence) {
        const entityType = data?.entityType as CanvasEntityType | undefined;
        return entityType ? TYPE_COLORS[entityType] : 'transparent';
      }
      return 'transparent';
    },
    shadowBlur: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isConvergence = data?.isConvergencePoint as boolean | undefined;
      return isConvergence ? 8 : 0;
    },
    labelText: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const label = data?.label as string | undefined;
      return truncateLabel(label ?? (d.id as string));
    },
    labelPlacement: 'bottom' as const,
    labelFontSize: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCenter = data?.isCenter as boolean | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      if (isCenter) return 13;
      if (isAggregate) return 12;
      return 11;
    },
    labelFill: '#393939',
    labelFontWeight: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const isCenter = data?.isCenter as boolean | undefined;
      const isAggregate = data?.isAggregate as boolean | undefined;
      if (isCenter || isAggregate) return 600;
      return 400;
    },
    labelMaxWidth: 120,
    cursor: 'pointer' as const,
  },
  state: sharedNodeStates,
};

// ── Edge style (shared across modes) ───────────────────────────────

/** G6 v5 edge style configuration object */
export const edgeStyleConfig = {
  type: 'quadratic' as const,
  style: {
    stroke: EDGE_DEFAULT_COLOR,
    lineWidth: 1,
    endArrow: false,
    cursor: 'default' as const,
  },
  state: {
    highlight: {
      stroke: '#4589ff',
      lineWidth: 2,
    },
    dim: {
      opacity: DIM_OPACITY,
    },
    filtered: {
      opacity: 0,
      pointerEvents: 'none' as const,
    },
  },
};

// ── Combo style (only used in legacy full-graph mode) ──────────────

/** G6 v5 combo style configuration object */
export const comboStyleConfig = {
  type: 'rect' as const,
  style: {
    fill: '#f0e6ff',
    fillOpacity: 0.08,
    stroke: '#6929C4',
    strokeOpacity: 0.4,
    lineWidth: 1,
    lineDash: [4, 4] as [number, number],
    radius: 12,
    padding: 30,
    labelText: (d: Record<string, unknown>) => {
      const data = d.data as Record<string, unknown> | undefined;
      const label = data?.label as string | undefined;
      return label ?? (d.id as string);
    },
    labelPlacement: 'top' as const,
    labelFontSize: 12,
    labelFill: '#6929C4',
    labelFontWeight: 600,
    collapsedSize: 60,
  },
  state: {
    dim: {
      opacity: DIM_OPACITY,
    },
    filtered: {
      opacity: 0,
      pointerEvents: 'none' as const,
    },
  },
};
