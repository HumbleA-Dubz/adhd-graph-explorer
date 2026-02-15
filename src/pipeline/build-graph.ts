import type { GraphData, PipelineWarning } from './types';
import { EntityLookup } from './entity-lookup';
import { parseAllEntities } from './parse-entities';
import { extractAllEdges } from './extract-edges';
import { parseCompatibilityMatrix } from './compatibility';
import { assignCombos } from './build-combos';

export interface PipelineResult {
  graph: GraphData;
  warnings: PipelineWarning[];
  stats: PipelineStats;
}

export interface PipelineStats {
  nodeCountsByType: Record<string, number>;
  canvasNodeCount: number;
  offCanvasCount: number;
  edgeCount: number;
  edgeCountsByType: Record<string, number>;
  comboCount: number;
  comboMembership: Record<string, number>;
  warningCount: number;
}

/**
 * Run the full YAML -> GraphData pipeline.
 *
 * Steps:
 * 1. Parse all YAML files into typed entity arrays
 * 2. Index entities in the lookup engine
 * 3. Extract cross-reference edges
 * 4. Parse compatibility matrix edges
 * 5. Assign combo membership
 * 6. Separate canvas nodes from off-canvas entities
 * 7. Compute stats
 */
export function buildGraph(yamlDir: string): PipelineResult {
  // 1. Parse
  const parsed = parseAllEntities(yamlDir);

  // 2. Index
  const lookup = new EntityLookup();
  lookup.index(parsed.all);

  // 3. Extract edges from entity cross-references
  const entityEdges = extractAllEdges(parsed, lookup);

  // 4. Parse compatibility matrix edges
  const compatEdges = parseCompatibilityMatrix(yamlDir, lookup);

  // 5. Combine all edges
  const allEdges = [...entityEdges, ...compatEdges];

  // 6. Assign combos and separate canvas/off-canvas
  const { canvasNodes, combos } = assignCombos(parsed.all);

  const offCanvasEntities = parsed.all.filter(
    (e) => e.type === 'claim' || e.type === 'source',
  );

  // 7. Build graph
  const graph: GraphData = {
    canvasNodes,
    offCanvasEntities,
    edges: allEdges,
    combos,
  };

  // 8. Compute stats
  const nodeCountsByType: Record<string, number> = {};
  for (const node of canvasNodes) {
    nodeCountsByType[node.type] = (nodeCountsByType[node.type] ?? 0) + 1;
  }
  for (const entity of offCanvasEntities) {
    nodeCountsByType[entity.type] = (nodeCountsByType[entity.type] ?? 0) + 1;
  }

  const edgeCountsByType: Record<string, number> = {};
  for (const edge of allEdges) {
    edgeCountsByType[edge.edgeType] = (edgeCountsByType[edge.edgeType] ?? 0) + 1;
  }

  const comboMembership: Record<string, number> = {};
  for (const combo of combos) {
    comboMembership[combo.id] = canvasNodes.filter(
      (n) => n.comboId === combo.id,
    ).length;
  }

  const stats: PipelineStats = {
    nodeCountsByType,
    canvasNodeCount: canvasNodes.length,
    offCanvasCount: offCanvasEntities.length,
    edgeCount: allEdges.length,
    edgeCountsByType,
    comboCount: combos.length,
    comboMembership,
    warningCount: lookup.warnings.length,
  };

  return {
    graph,
    warnings: lookup.warnings,
    stats,
  };
}
