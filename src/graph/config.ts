import type { NodeData, EdgeData, ComboData, GraphData as G6GraphData } from '@antv/g6';
import type { GraphData } from '@/pipeline/types';
import { nodeStyleConfig, edgeStyleConfig, comboStyleConfig } from './styles';
import { layoutConfig } from './layouts';

/**
 * Transform our GraphData into G6 v5 format.
 * Only includes edges where BOTH endpoints are canvas nodes (visible on graph).
 */
export function transformGraphData(graphData: GraphData): G6GraphData {
  const canvasNodeIds = new Set(graphData.canvasNodes.map(n => n.id));

  const nodes: NodeData[] = graphData.canvasNodes.map(node => ({
    id: node.id,
    data: {
      ...node.data,
      entityType: node.type,
      label: node.label,
      isConvergencePoint: node.isConvergencePoint ?? false,
      secondaryClusters: node.secondaryClusters ?? [],
    },
    ...(node.comboId ? { combo: node.comboId } : {}),
  }));

  // Only keep edges where both source and target are canvas nodes
  const edges: EdgeData[] = graphData.edges
    .filter(e => canvasNodeIds.has(e.source) && canvasNodeIds.has(e.target))
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: {
        ...edge.data,
        edgeType: edge.edgeType,
      },
    }));

  const combos: ComboData[] = graphData.combos.map(combo => ({
    id: combo.id,
    data: {
      ...combo.data,
      label: combo.label,
    },
  }));

  return { nodes, edges, combos };
}

/** Build the G6 Graph configuration options */
export function createGraphOptions(data: G6GraphData) {
  return {
    data,
    node: nodeStyleConfig,
    edge: edgeStyleConfig,
    combo: comboStyleConfig,
    layout: layoutConfig,
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    autoFit: 'view' as const,
    animation: true,
  };
}
