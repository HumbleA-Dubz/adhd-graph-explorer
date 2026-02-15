import type { GraphData } from '@/pipeline/types';
import type { PresetConfig, NodeStyleOverride } from './index';

/**
 * Impact preset: "What's high-impact?"
 *
 * Node size maps to:
 * - Problems: scores.total (range 8-14) → interpolate 25px to 60px radius
 * - Meta challenges: severity text → size mapping
 * - All other entity types: keep default size
 */
export function createImpactPreset(data: GraphData): PresetConfig {
  const nodeStyles = new Map<string, NodeStyleOverride>();

  const severityMap: Record<string, number> = {
    'Critical': 60,
    'High': 50,
    'Moderate-High': 45,
    'Moderate': 40,
  };

  for (const node of data.canvasNodes) {
    if (node.type === 'problem') {
      const scores = node.data.scores as { total?: number } | undefined;
      const totalScore = scores?.total;

      if (totalScore !== undefined && typeof totalScore === 'number') {
        // Interpolate from 8→25px to 14→60px
        const size = 25 + ((totalScore - 8) / (14 - 8)) * (60 - 25);
        nodeStyles.set(node.id, { size: Math.max(25, Math.min(60, size)) });
      }
    } else if (node.type === 'meta_challenge') {
      const severity = node.data.severity as string | undefined;

      if (severity && severityMap[severity]) {
        nodeStyles.set(node.id, { size: severityMap[severity] });
      }
    }
    // All other entity types: no override (keep default)
  }

  return {
    nodeStyles,
    edgeStyles: new Map(),
    description: "What's high-impact?",
  };
}
