import type { Graph } from '@antv/g6';
import type { GraphData } from '@/pipeline/types';
import type { PresetName } from '@/store';

import { createDefaultPreset } from './default';
import { createEvidencePreset } from './evidence';
import { createImpactPreset } from './impact';
import { createMechanismsPreset } from './mechanisms';
import { createCompatibilityPreset } from './compatibility';
import { createFoundationsPreset } from './foundations';
import { createVulnerabilityPreset } from './vulnerability';

// ── Type definitions ───────────────────────────────────────────────────

export interface NodeStyleOverride {
  fill?: string;
  size?: number | [number, number];
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
}

export interface EdgeStyleOverride {
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  lineDash?: number[];
}

export interface PresetConfig {
  nodeStyles: Map<string, NodeStyleOverride>;
  edgeStyles: Map<string, EdgeStyleOverride>;
  description: string;
}

export type PresetFunction = (data: GraphData) => PresetConfig;

// ── Registry ───────────────────────────────────────────────────────────

export const PRESETS: Record<PresetName, PresetFunction> = {
  default: createDefaultPreset,
  evidence: createEvidencePreset,
  impact: createImpactPreset,
  mechanisms: createMechanismsPreset,
  compatibility: createCompatibilityPreset,
  foundations: createFoundationsPreset,
  vulnerability: createVulnerabilityPreset,
};

export const PRESET_DESCRIPTIONS: Record<PresetName, string> = {
  default: "What's the structure?",
  evidence: "What's well-evidenced?",
  impact: "What's high-impact?",
  mechanisms: 'What shares mechanisms?',
  compatibility: 'What works where?',
  foundations: 'What do we need to build?',
  vulnerability: 'Where are the risks?',
};

// ── Apply preset ───────────────────────────────────────────────────────

export function applyPreset(graph: Graph, data: GraphData, presetName: PresetName): void {
  const presetFn = PRESETS[presetName];
  const config = presetFn(data);

  // Apply node styles
  config.nodeStyles.forEach((style, nodeId) => {
    graph.updateNodeData([{ id: nodeId, style: style as any }]);
  });

  // Apply edge styles
  config.edgeStyles.forEach((style, edgeId) => {
    graph.updateEdgeData([{ id: edgeId, style: style as any }]);
  });

  graph.draw(); // re-render with animation
}
