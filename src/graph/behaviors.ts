import type { Graph, IPointerEvent } from '@antv/g6';

/**
 * Register hover-highlight and click-select event handlers on the G6 graph instance.
 * These connect G6 events to the Zustand store for state management.
 */
export function registerGraphBehaviors(
  graph: Graph,
  callbacks: {
    onNodeClick: (nodeId: string) => void;
    onNodeHover: (nodeId: string | null) => void;
    onCanvasClick: () => void;
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

  // ── Click Select ─────────────────────────────────────────────
  graph.on('node:click', (evt: IPointerEvent) => {
    const nodeId = (evt.target as unknown as { id: string }).id;
    callbacks.onNodeClick(nodeId);
  });

  graph.on('canvas:click', () => {
    callbacks.onCanvasClick();
  });
}

/** Apply highlight to a node and its direct neighbors; dim everything else */
function applyHighlight(graph: Graph, nodeId: string): void {
  const neighborNodes = graph.getNeighborNodesData(nodeId).map(n => n.id as string);
  const relatedEdges = graph.getRelatedEdgesData(nodeId).map(e => e.id as string);

  const highlightSet = new Set<string>([nodeId, ...neighborNodes]);
  const highlightEdgeSet = new Set<string>(relatedEdges);

  // Build batch state update
  const states: Record<string, string[]> = {};

  const allNodes = graph.getNodeData();
  for (const node of allNodes) {
    const id = node.id as string;
    states[id] = highlightSet.has(id) ? ['highlight'] : ['dim'];
  }

  const allEdges = graph.getEdgeData();
  for (const edge of allEdges) {
    const id = edge.id as string;
    states[id] = highlightEdgeSet.has(id) ? ['highlight'] : ['dim'];
  }

  graph.setElementState(states);
}

/** Clear all highlight/dim states */
function clearHighlight(graph: Graph): void {
  const states: Record<string, string[]> = {};

  const allNodes = graph.getNodeData();
  for (const node of allNodes) {
    states[node.id as string] = [];
  }

  const allEdges = graph.getEdgeData();
  for (const edge of allEdges) {
    states[edge.id as string] = [];
  }

  graph.setElementState(states);
}
