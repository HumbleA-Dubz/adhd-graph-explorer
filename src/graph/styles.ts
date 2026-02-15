import type { CanvasEntityType } from '@/pipeline/types';
import { TYPE_COLORS, EDGE_DEFAULT_COLOR, DIM_OPACITY } from '@/theme/palette';
import { NODE_SIZES, NODE_SHAPES } from '@/theme/constants';

/** Truncate a label string for display on the canvas */
function truncateLabel(text: string, maxLen = 25): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}

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
  state: {
    highlight: {
      lineWidth: 3,
      shadowBlur: 12,
      shadowColor: 'rgba(15, 98, 254, 0.4)',
    },
    dim: {
      opacity: DIM_OPACITY,
    },
    selected: {
      lineWidth: 3,
      stroke: '#0f62fe',
      shadowBlur: 10,
      shadowColor: 'rgba(15, 98, 254, 0.5)',
    },
  },
};

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
  },
};

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
  },
};
