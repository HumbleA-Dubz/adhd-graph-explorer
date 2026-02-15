import { create } from 'zustand';
import type { GraphData, CanvasEntityType, CanvasNode, Entity, GraphEdge } from '@/pipeline/types';

export type PresetName = 'default' | 'evidence' | 'impact' | 'mechanisms' | 'compatibility' | 'foundations' | 'vulnerability';

interface AppStore {
  // Graph data (loaded once at startup)
  graphData: GraphData | null;
  setGraphData: (data: GraphData) => void;

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

  // Derived data helpers
  getNodeById: (id: string) => CanvasNode | Entity | undefined;
  getEdgesForNode: (nodeId: string) => GraphEdge[];
  getConnectedNodes: (nodeId: string) => (CanvasNode | Entity)[];
}

export const useStore = create<AppStore>((set, get) => ({
  // Initial state
  graphData: null,
  selectedNodeId: null,
  hoveredNodeId: null,
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

  // Derived helpers
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
}));
