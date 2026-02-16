import { useState, useEffect, useRef, useCallback } from 'react';
import { Graph } from '@antv/g6';
import graphJson from '@/data/graph.json';
import { useStore } from '@/store';
import { transformGraphData, createGraphOptions } from '@/graph/config';
import { registerGraphBehaviors } from '@/graph/behaviors';
import { applyPreset } from '@/graph/presets';
import type { GraphData, CanvasEntityType } from '@/pipeline/types';

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const graphDataRef = useRef<GraphData | null>(null);
  const initializedRef = useRef(false);
  const [error] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const setGraphData = useStore(state => state.setGraphData);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const setHoveredNode = useStore(state => state.setHoveredNode);
  const selectedNodeId = useStore(state => state.selectedNodeId);

  // Stable callback refs to avoid stale closures in G6 event handlers
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;

  const handleNodeClick = useCallback((nodeId: string) => {
    // Toggle selection: if same node, deselect
    if (selectedNodeIdRef.current === nodeId) {
      setSelectedNode(null);
    } else {
      setSelectedNode(nodeId);
    }
  }, [setSelectedNode]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, [setHoveredNode]);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Initialize graph on mount
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    const container = containerRef.current;

    // Load data into Zustand store
    const graphData = graphJson as unknown as GraphData;
    setGraphData(graphData);
    graphDataRef.current = graphData;

    // Transform to G6 format
    const g6Data = transformGraphData(graphData);
    const options = createGraphOptions(g6Data);

    async function init() {
      let graph: Graph | null = null;
      try {
        graph = new Graph({
          container,
          width: container.clientWidth || window.innerWidth,
          height: container.clientHeight || window.innerHeight,
          ...options,
        });

        // Register custom behaviors
        registerGraphBehaviors(graph, {
          onNodeClick: handleNodeClick,
          onNodeHover: handleNodeHover,
          onCanvasClick: handleCanvasClick,
        });

        try {
          await graph.render();
        } catch (renderErr) {
          // G6 v5.0.51 has a known bug where combo processing throws
          // "r.assign is not a function" — the graph still renders fine.
          console.warn('[G6] Non-fatal render error (graph may still work):', renderErr);
        }
      } catch (err) {
        console.warn('[G6] Error during init (graph may still work):', err);
      }

      // Mark ready and expose graph if G6 created canvases
      if (graph && container.querySelector('canvas')) {
        graphRef.current = graph;
        setReady(true);

        // Auto fit-to-screen: listen for layout completion + fallbacks
        const doFit = () => {
          try { graph!.fitView(); } catch { /* destroyed */ }
        };
        graph.once('afterlayout', doFit);
        // Staggered fallbacks in case afterlayout doesn't fire
        setTimeout(doFit, 5000);
        setTimeout(doFit, 12000);
      }
    }

    init();

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [setGraphData, handleNodeClick, handleNodeHover, handleCanvasClick]);

  // ── Preset application ──────────────────────────────────────────────
  const activePreset = useStore(state => state.activePreset);
  useEffect(() => {
    if (!ready) return;
    const graph = graphRef.current;
    const graphData = graphDataRef.current;
    if (!graph || !graphData) return;

    applyPreset(graph, graphData, activePreset);
  }, [activePreset, ready]);

  // ── Keyboard navigation ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedNode]);

  // Respond to filter changes: visibleEntityTypes + visibleClusters
  // Uses setElementState with a 'filtered' state (opacity:0, pointerEvents:none)
  // instead of setElementVisibility which is buggy in G6 v5.0.51.
  const visibleEntityTypes = useStore(state => state.visibleEntityTypes);
  const visibleClusters = useStore(state => state.visibleClusters);
  useEffect(() => {
    if (!ready) return;
    const graph = graphRef.current;
    if (!graph) return;

    try {
      const states: Record<string, string[]> = {};

      // Build a set of visible node IDs for edge filtering
      const visibleNodeIds = new Set<string>();

      // Filter nodes by entity type
      const allNodes = graph.getNodeData();
      for (const node of allNodes) {
        const id = node.id as string;
        const entityType = (node.data as Record<string, unknown>)?.entityType as CanvasEntityType | undefined;
        if (!entityType) continue;

        if (visibleEntityTypes.has(entityType)) {
          visibleNodeIds.add(id);
          states[id] = []; // clear filtered state
        } else {
          states[id] = ['filtered'];
        }
      }

      // Filter edges: only visible if BOTH endpoints are visible
      const allEdges = graph.getEdgeData();
      for (const edge of allEdges) {
        const id = edge.id as string;
        const sourceVisible = visibleNodeIds.has(edge.source as string);
        const targetVisible = visibleNodeIds.has(edge.target as string);
        states[id] = (sourceVisible && targetVisible) ? [] : ['filtered'];
      }

      // Filter combos by cluster visibility
      const allCombos = graph.getComboData();
      for (const combo of allCombos) {
        const id = combo.id as string;
        states[id] = visibleClusters.has(id) ? [] : ['filtered'];
      }

      graph.setElementState(states);
    } catch {
      // Elements may not exist yet during initial render — safe to ignore
    }
  }, [visibleEntityTypes, visibleClusters, ready]);

  // Handle window resize with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const graph = graphRef.current;
      if (!graph) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          graph.resize(width, height);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Fit-to-screen handler (exposed via a button in Toolbar) ─────────
  const handleFitView = useCallback(() => {
    const graph = graphRef.current;
    if (graph) {
      graph.fitView();
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace', color: '#da1e28' }}>
        <h2>Graph failed to render</h2>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '12px', background: '#f4f4f4', padding: '16px', borderRadius: '4px' }}>
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Loading indicator */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#525252', fontSize: '14px', fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'none',
        }}>
          Laying out graph…
        </div>
      )}
      {/* Fit-to-screen button — bottom-right corner */}
      <button
        onClick={handleFitView}
        title="Fit to screen"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          background: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#525252',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f4f4f4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
        }}
      >
        ⛶
      </button>
    </div>
  );
}
