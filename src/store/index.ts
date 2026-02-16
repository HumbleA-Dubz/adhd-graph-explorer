import { create } from 'zustand';
import type { GraphData, CanvasEntityType, CanvasNode, Entity, GraphEdge } from '@/pipeline/types';

export type PresetName = 'default' | 'evidence' | 'impact' | 'mechanisms' | 'compatibility' | 'foundations' | 'vulnerability';
export type ViewMode = 'overview' | 'neighborhood';

/** Hub problem IDs for each cluster — clicking a cluster enters neighborhood centered on its hub */
const CLUSTER_HUBS: Record<string, string> = {
  CL_A: 'FP03', // Time Estimation and Time Blindness
  CL_B: 'FP01', // Task Initiation Failure
  CL_C: 'FP02', // Inconsistent Focus
};

interface AppStore {
  // Graph data (loaded once at startup)
  graphData: GraphData | null;
  setGraphData: (data: GraphData) => void;

  // ── Navigation ────────────────────────────────────────────
  viewMode: ViewMode;
  focusNodeId: string | null;
  navigationHistory: string[];   // stack of previous focusNodeIds
  expandedGroups: Set<string>;   // which entity types are expanded in neighborhood

  enterNeighborhood: (nodeId: string) => void;
  navigateToNeighbor: (nodeId: string) => void;
  expandGroup: (entityType: string) => void;
  collapseGroup: (entityType: string) => void;
  goBack: () => void;
  goToOverview: () => void;
  getClusterHub: (clusterId: string) => string | undefined;

  // Selection
  selectedNodeId: string | null;
  setSelectedNode: (id: string | null) => void;

  // Hover
  hoveredNodeId: string | null;
  setHoveredNode: (id: string | null) => void;

  // Filters
  visibleEntityTypes: Set<CanvasEntityType>;
  toggleEntityType: (type: CanvasEntityType) => void;
  visibleClusters: Set<string>;
  toggleCluster: (clusterId: string) => void;

  // Encoding preset
  activePreset: PresetName;
  setActivePreset: (preset: PresetName) => void;

  // ── Derived data helpers ──────────────────────────────────
  getNodeById: (id: string) => CanvasNode | Entity | undefined;
  getEdgesForNode: (nodeId: string) => GraphEdge[];
  getConnectedNodes: (nodeId: string) => (CanvasNode | Entity)[];

  /** Returns overview-eligible nodes: 3 clusters (as virtual nodes) + 6 mechanisms */
  getOverviewData: () => {
    clusterNodes: { id: string; label: string; hub: string; memberCount: number }[];
    mechanismNodes: CanvasNode[];
    edges: { source: string; target: string; edgeType: string }[];
  };

  /** Returns 1-hop neighborhood data for a focus node */
  getNeighborhoodData: (nodeId: string) => {
    center: CanvasNode;
    neighborsByType: Map<CanvasEntityType, CanvasNode[]>;
    edges: GraphEdge[];
  } | null;
}

export const useStore = create<AppStore>((set, get) => ({
  // Initial state
  graphData: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  viewMode: 'overview',
  focusNodeId: null,
  navigationHistory: [],
  expandedGroups: new Set(),
  visibleEntityTypes: new Set([
    'problem',
    'mechanism',
    'engagement_model',
    'meta_challenge',
    'foundation',
    'technology',
    'implication',
  ]),
  visibleClusters: new Set(['CL_A', 'CL_B', 'CL_C']),
  activePreset: 'default',

  // Actions
  setGraphData: (data) => set({ graphData: data }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  // ── Navigation actions ──────────────────────────────────────
  enterNeighborhood: (nodeId) => set({
    viewMode: 'neighborhood',
    focusNodeId: nodeId,
    navigationHistory: [],
    expandedGroups: new Set(),
    selectedNodeId: null,
  }),

  navigateToNeighbor: (nodeId) => set((state) => ({
    focusNodeId: nodeId,
    navigationHistory: state.focusNodeId
      ? [...state.navigationHistory, state.focusNodeId]
      : state.navigationHistory,
    expandedGroups: new Set(),
    selectedNodeId: null,
  })),

  expandGroup: (entityType) => set((state) => {
    const newSet = new Set(state.expandedGroups);
    newSet.add(entityType);
    return { expandedGroups: newSet };
  }),

  collapseGroup: (entityType) => set((state) => {
    const newSet = new Set(state.expandedGroups);
    newSet.delete(entityType);
    return { expandedGroups: newSet };
  }),

  goBack: () => set((state) => {
    if (state.navigationHistory.length === 0) {
      // Return to overview
      return {
        viewMode: 'overview',
        focusNodeId: null,
        navigationHistory: [],
        expandedGroups: new Set(),
        selectedNodeId: null,
      };
    }
    const newHistory = [...state.navigationHistory];
    const previousNodeId = newHistory.pop()!;
    return {
      focusNodeId: previousNodeId,
      navigationHistory: newHistory,
      expandedGroups: new Set(),
      selectedNodeId: null,
    };
  }),

  goToOverview: () => set({
    viewMode: 'overview',
    focusNodeId: null,
    navigationHistory: [],
    expandedGroups: new Set(),
    selectedNodeId: null,
  }),

  getClusterHub: (clusterId) => CLUSTER_HUBS[clusterId],

  // ── Filter actions ──────────────────────────────────────────
  toggleEntityType: (type) => set((state) => {
    const newSet = new Set(state.visibleEntityTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    return { visibleEntityTypes: newSet };
  }),

  toggleCluster: (clusterId) => set((state) => {
    const newSet = new Set(state.visibleClusters);
    if (newSet.has(clusterId)) {
      newSet.delete(clusterId);
    } else {
      newSet.add(clusterId);
    }
    return { visibleClusters: newSet };
  }),

  setActivePreset: (preset) => set({ activePreset: preset }),

  // ── Derived helpers ──────────────────────────────────────────
  getNodeById: (id) => {
    const data = get().graphData;
    if (!data) return undefined;

    const canvasNode = data.canvasNodes.find(n => n.id === id);
    if (canvasNode) return canvasNode;

    return data.offCanvasEntities.find(e => e.id === id);
  },

  getEdgesForNode: (nodeId) => {
    const data = get().graphData;
    if (!data) return [];

    return data.edges.filter(e => e.source === nodeId || e.target === nodeId);
  },

  getConnectedNodes: (nodeId) => {
    const data = get().graphData;
    if (!data) return [];

    const edges = get().getEdgesForNode(nodeId);
    const connectedIds = edges.map(e => e.source === nodeId ? e.target : e.source);

    return connectedIds
      .map(id => get().getNodeById(id))
      .filter((n): n is CanvasNode | Entity => n !== undefined);
  },

  getOverviewData: () => {
    const data = get().graphData;
    if (!data) return { clusterNodes: [], mechanismNodes: [], edges: [] };

    // Build cluster virtual nodes from combo data
    const clusterNodes = data.combos.map(combo => {
      const members = (combo.data.members as Array<{ problem: string }>) ?? [];
      return {
        id: combo.id,
        label: combo.label,
        hub: CLUSTER_HUBS[combo.id] ?? '',
        memberCount: members.length,
      };
    });

    // Get all mechanism nodes
    const mechanismNodes = data.canvasNodes.filter(n => n.type === 'mechanism');

    // Get cluster_mechanism edges (the only edges shown in overview)
    const edges = data.edges
      .filter(e => e.edgeType === 'cluster_mechanism')
      .map(e => ({ source: e.source, target: e.target, edgeType: e.edgeType }));

    return { clusterNodes, mechanismNodes, edges };
  },

  getNeighborhoodData: (nodeId) => {
    const data = get().graphData;
    if (!data) return null;

    const center = data.canvasNodes.find(n => n.id === nodeId);
    if (!center) return null;

    // Find all canvas edges connected to this node
    const canvasNodeIds = new Set(data.canvasNodes.map(n => n.id));
    const connectedEdges = data.edges.filter(e =>
      (e.source === nodeId || e.target === nodeId) &&
      canvasNodeIds.has(e.source) &&
      canvasNodeIds.has(e.target)
    );

    // Get 1-hop neighbor IDs (unique, excluding center)
    const neighborIds = new Set<string>();
    for (const edge of connectedEdges) {
      const otherId = edge.source === nodeId ? edge.target : edge.source;
      if (otherId !== nodeId) neighborIds.add(otherId);
    }

    // Group neighbors by entity type
    const neighborsByType = new Map<CanvasEntityType, CanvasNode[]>();
    for (const nId of neighborIds) {
      const node = data.canvasNodes.find(n => n.id === nId);
      if (!node) continue;
      const existing = neighborsByType.get(node.type) ?? [];
      existing.push(node);
      neighborsByType.set(node.type, existing);
    }

    return { center, neighborsByType, edges: connectedEdges };
  },
}));
