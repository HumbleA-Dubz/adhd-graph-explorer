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

/** Check if an element is currently in the 'filtered' (hidden) state */
function isFiltered(graph: Graph, elementId: string): boolean {
  try {
    const currentState = graph.getElementState(elementId);
    return Array.isArray(currentState) && currentState.includes('filtered');
  } catch {
    return false;
  }
}

/** Apply highlight to a node and its direct neighbors; dim everything else.
 *  Preserves the 'filtered' state on hidden elements so they stay invisible. */
function applyHighlight(graph: Graph, nodeId: string): void {
  // Don't highlight filtered (hidden) nodes
  if (isFiltered(graph, nodeId)) return;

  const neighborNodes = graph.getNeighborNodesData(nodeId).map(n => n.id as string);
  const relatedEdges = graph.getRelatedEdgesData(nodeId).map(e => e.id as string);

  const highlightSet = new Set<string>([nodeId, ...neighborNodes]);
  const highlightEdgeSet = new Set<string>(relatedEdges);

  // Build batch state update — preserve 'filtered' state on hidden elements
  const states: Record<string, string[]> = {};

  const allNodes = graph.getNodeData();
  for (const node of allNodes) {
    const id = node.id as string;
    if (isFiltered(graph, id)) {
      states[id] = ['filtered']; // keep hidden
    } else {
      states[id] = highlightSet.has(id) ? ['highlight'] : ['dim'];
    }
  }

  const allEdges = graph.getEdgeData();
  for (const edge of allEdges) {
    const id = edge.id as string;
    if (isFiltered(graph, id)) {
      states[id] = ['filtered']; // keep hidden
    } else {
      states[id] = highlightEdgeSet.has(id) ? ['highlight'] : ['dim'];
    }
  }

  graph.setElementState(states);
}

/** Clear all highlight/dim states. Preserves 'filtered' state on hidden elements. */
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
