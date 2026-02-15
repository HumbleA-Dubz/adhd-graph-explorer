import type { GraphData } from '@/pipeline/types';
import type { PresetConfig, NodeStyleOverride } from './index';
import { EVIDENCE_SCALE } from '@/theme/palette';

/**
 * Evidence preset: "What's well-evidenced?"
 *
 * Node fill maps to evidence_tier field:
 * - Problems have decimal scores: 1.0, 1.3, 1.7, 2.0, 3.0, 3.3
 * - Scale: 1.0 = strongest (darkest blue #001D6C), 3.3 = weakest (lightest blue #BAE6FF)
 * - Entities WITHOUT evidence_tier: grey fill (#E0E0E0)
 * - Linear interpolation for fill color
 */
export function createEvidencePreset(data: GraphData): PresetConfig {
  const nodeStyles = new Map<string, NodeStyleOverride>();

  for (const node of data.canvasNodes) {
    const evidenceTier = node.data.evidence_tier;

    if (evidenceTier === undefined || evidenceTier === null) {
      // No data → grey
      nodeStyles.set(node.id, { fill: EVIDENCE_SCALE.noData });
      continue;
    }

    // Convert to number (handles both number and string)
    const tierValue = typeof evidenceTier === 'number' ? evidenceTier : parseFloat(evidenceTier as string);

    if (isNaN(tierValue)) {
      nodeStyles.set(node.id, { fill: EVIDENCE_SCALE.noData });
      continue;
    }

    // Linear interpolation between tier 1.0 (strong) and 3.3 (weak)
    const t = (tierValue - 1.0) / (3.3 - 1.0); // normalize to [0, 1]
    const fill = interpolateColor(EVIDENCE_SCALE.strong, EVIDENCE_SCALE.weak, Math.max(0, Math.min(1, t)));

    nodeStyles.set(node.id, { fill });
  }

  return {
    nodeStyles,
    edgeStyles: new Map(),
    description: "What's well-evidenced?",
  };
}

/**
 * Linear RGB interpolation between two hex colors
 */
function interpolateColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
