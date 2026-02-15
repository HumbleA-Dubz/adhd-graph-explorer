import type { GraphData } from '@/pipeline/types';
import type { PresetConfig } from './index';

/**
 * Default preset: "What's the structure?"
 *
 * Resets everything to defaults. Node fill from TYPE_COLORS by entity type.
 * Default sizes from NODE_SIZES. All edges shown at equal weight.
 * Effectively clears all overrides — returns empty Maps.
 */
export function createDefaultPreset(_data: GraphData): PresetConfig {
  return {
    nodeStyles: new Map(),
    edgeStyles: new Map(),
    description: "What's the structure?",
  };
}
