import type { Graph, IPointerEvent } from '@antv/g6';
import { isAggregateNode, getAggregateType } from './aggregates';
import type { ViewMode } from '@/store';

/**
 * Register mode-aware event handlers on the G6 graph instance.
 *
 * Overview mode: click → enter neighborhood
 * Neighborhood mode: click aggregate → expand, click neighbor → navigate, click center → select
 */
export function registerGraphBehaviors(
  graph: Graph,
  viewMode: ViewMode,
  callbacks: {
    onNodeClick: (nodeId: string) => void;
    onNodeHover: (nodeId: string | null) => void;
    onCanvasClick: () => void;
    onAggregateClick: (entityType: string) => void;
    onNeighborClick: (nodeId: string) => void;
    onCenterClick: (nodeId: string) => void;
    onClusterClick: (clusterId: string) => void;
  },
): void {
  // ── Hover Highlight ──────────────────────────────────────────
  graph.on('node:pointerenter', (evt: IPointerEvent) => {
    const nodeId = (evt.target as unknown as { id: string }).id;
    callbacks.onNodeHover(nodeId);
    applyHighlight(graph, nodeId);
  });

  graph.on('node:pointerleave', () => {
    callbacks.onNodeHover(null);
    clearHighlight(graph);
  });

  // ── Click ───────────────────────────────────────────────────
  graph.on('node:click', (evt: IPointerEvent) => {
    const nodeId = (evt.target as unknown as { id: string }).id;

    if (viewMode === 'overview') {
      // Check if it's a cluster node
      try {
        const nodeData = graph.getNodeData(nodeId);
        const data = nodeData?.data as Record<string, unknown> | undefined;
        const isCluster = data?.isClusterNode as boolean | undefined;
        if (isCluster) {
          callbacks.onClusterClick(nodeId);
          return;
        }
      } catch { /* not found */ }
      // Non-cluster node in overview (mechanism) → enter neighborhood on it
      callbacks.onNodeClick(nodeId);
      return;
    }

    // Neighborhood mode
    if (isAggregateNode(nodeId)) {
      const entityType = getAggregateType(nodeId);
      if (entityType) {
        callbacks.onAggregateClick(entityType);
      }
      return;
    }

    // Check if it's the center node
    try {
      const nodeData = graph.getNodeData(nodeId);
      const data = nodeData?.data as Record<string, unknown> | undefined;
      const isCenter = data?.isCenter as boolean | undefined;
      if (isCenter) {
        callbacks.onCenterClick(nodeId);
        return;
      }
    } catch { /* not found */ }

    // Regular neighbor → navigate to it
    callbacks.onNeighborClick(nodeId);
  });

  // ── Double-click: always open detail panel ──────────────────
  graph.on('node:dblclick', (evt: IPointerEvent) => {
    const nodeId = (evt.target as unknown as { id: string }).id;
    if (!isAggregateNode(nodeId)) {
      callbacks.onCenterClick(nodeId);
    }
  });

  graph.on('canvas:click', () => {
    callbacks.onCanvasClick();
  });
}

/** Check if an element is currently in the 'filtered' (hidden) state */
function isFiltered(graph: Graph, elementId: string): boolean {
  try {
    const currentState = graph.getElementState(elementId);
    return Array.isArray(currentState) && currentState.includes('filtered');
  } catch {
    return false;
  }
}

/** Apply highlight to a node and its direct neighbors; dim everything else. */
function applyHighlight(graph: Graph, nodeId: string): void {
  if (isFiltered(graph, nodeId)) return;

  const neighborNodes = graph.getNeighborNodesData(nodeId).map(n => n.id as string);
  const relatedEdges = graph.getRelatedEdgesData(nodeId).map(e => e.id as string);

  const highlightSet = new Set<string>([nodeId, ...neighborNodes]);
  const highlightEdgeSet = new Set<string>(relatedEdges);

  const states: Record<string, string[]> = {};

  const allNodes = graph.getNodeData();
  for (const node of allNodes) {
    const id = node.id as string;
    if (isFiltered(graph, id)) {
      states[id] = ['filtered'];
    } else {
      states[id] = highlightSet.has(id) ? ['highlight'] : ['dim'];
    }
  }

  const allEdges = graph.getEdgeData();
  for (const edge of allEdges) {
    const id = edge.id as string;
    if (isFiltered(graph, id)) {
      states[id] = ['filtered'];
    } else {
      states[id] = highlightEdgeSet.has(id) ? ['highlight'] : ['dim'];
    }
  }

  graph.setElementState(states);
}

/** Clear all highlight/dim states. Preserves 'filtered' state. */
function clearHighlight(graph: Graph): void {
  const states: Record<string, string[]> = {};

  const allNodes = graph.getNodeData();
  for (const node of allNodes) {
    const id = node.id as string;
    states[id] = isFiltered(graph, id) ? ['filtered'] : [];
  }

  const allEdges = graph.getEdgeData();
  for (const edge of allEdges) {
    const id = edge.id as string;
    states[id] = isFiltered(graph, id) ? ['filtered'] : [];
  }

  graph.setElementState(states);
}
