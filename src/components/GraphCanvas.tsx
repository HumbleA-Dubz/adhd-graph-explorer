import { useState, useEffect, useRef, useCallback } from 'react';
import { Graph } from '@antv/g6';
import graphJson from '@/data/graph.json';
import { useStore } from '@/store';
import { createOverviewGraphOptions, createNeighborhoodGraphOptions } from '@/graph/config';
import { registerGraphBehaviors } from '@/graph/behaviors';
import { applyPreset } from '@/graph/presets';
import { buildOverviewGraph, buildNeighborhoodGraph } from '@/graph/aggregates';
import type { GraphData } from '@/pipeline/types';

/**
 * GraphCanvas — Two-mode graph renderer.
 *
 * Overview mode: shows 9 nodes (3 clusters + 6 mechanisms) with cluster→mechanism edges.
 * Neighborhood mode: shows a center node + its neighbors (grouped by type as aggregates).
 *
 * Strategy: destroy and recreate the G6 Graph on every mode/focus transition.
 * This is the safest approach given G6 v5.0.51's bugs with show/hide.
 */
export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const graphDataRef = useRef<GraphData | null>(null);
  const [ready, setReady] = useState(false);

  // Store selectors
  const setGraphData = useStore(state => state.setGraphData);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const setHoveredNode = useStore(state => state.setHoveredNode);
  const viewMode = useStore(state => state.viewMode);
  const focusNodeId = useStore(state => state.focusNodeId);
  const expandedGroups = useStore(state => state.expandedGroups);
  const enterNeighborhood = useStore(state => state.enterNeighborhood);
  const navigateToNeighbor = useStore(state => state.navigateToNeighbor);
  const expandGroup = useStore(state => state.expandGroup);
  const goBack = useStore(state => state.goBack);
  const getClusterHub = useStore(state => state.getClusterHub);

  // Load graph data once on mount
  useEffect(() => {
    if (graphDataRef.current) return;
    const graphData = graphJson as unknown as GraphData;
    setGraphData(graphData);
    graphDataRef.current = graphData;
  }, [setGraphData]);

  // Serialize expandedGroups to a stable string for useEffect deps
  const expandedKey = [...expandedGroups].sort().join(',');

  // ── Build and render graph on mode/focus/expansion changes ──────────
  useEffect(() => {
    const container = containerRef.current;
    const graphData = graphDataRef.current;
    if (!container || !graphData) return;

    // Destroy previous graph
    if (graphRef.current) {
      try { graphRef.current.destroy(); } catch { /* already destroyed */ }
      graphRef.current = null;
    }
    setReady(false);

    // Clear any leftover canvas elements
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Build mode-specific data and options
    let options: Record<string, unknown>;

    if (viewMode === 'overview') {
      const store = useStore.getState();
      const overviewData = store.getOverviewData();
      const g6Data = buildOverviewGraph(
        overviewData.clusterNodes,
        overviewData.mechanismNodes,
        overviewData.edges,
      );
      options = createOverviewGraphOptions(g6Data);
    } else {
      // Neighborhood mode
      if (!focusNodeId) return;
      const store = useStore.getState();
      const neighborhoodData = store.getNeighborhoodData(focusNodeId);
      if (!neighborhoodData) return;

      const g6Data = buildNeighborhoodGraph(
        neighborhoodData.center,
        neighborhoodData.neighborsByType,
        neighborhoodData.edges,
        expandedGroups,
      );
      options = createNeighborhoodGraphOptions(g6Data);
    }

    async function init() {
      const el = container!;
      let graph: Graph | null = null;
      try {
        graph = new Graph({
          container: el,
          width: el.clientWidth || window.innerWidth,
          height: el.clientHeight || window.innerHeight,
          ...options,
        } as any);

        // Register mode-aware behaviors
        registerGraphBehaviors(graph, viewMode, {
          onNodeClick: (nodeId: string) => {
            // In overview: mechanisms enter neighborhood
            enterNeighborhood(nodeId);
          },
          onNodeHover: (nodeId: string | null) => {
            setHoveredNode(nodeId);
          },
          onCanvasClick: () => {
            setSelectedNode(null);
          },
          onAggregateClick: (entityType: string) => {
            expandGroup(entityType);
          },
          onNeighborClick: (nodeId: string) => {
            navigateToNeighbor(nodeId);
          },
          onCenterClick: (nodeId: string) => {
            // Always select (deselection via canvas click or panel close)
            setSelectedNode(nodeId);
          },
          onClusterClick: (clusterId: string) => {
            const hubId = getClusterHub(clusterId);
            if (hubId) {
              enterNeighborhood(hubId);
            }
          },
        });

        try {
          await graph.render();
        } catch (renderErr) {
          // G6 v5.0.51 non-fatal render errors (e.g. r.assign combo bug)
          console.warn('[G6] Non-fatal render error:', renderErr);
        }
      } catch (err) {
        console.warn('[G6] Error during init:', err);
      }

      // Mark ready if G6 created a canvas
      if (graph && el.querySelector('canvas')) {
        graphRef.current = graph;
        setReady(true);

        const doFit = () => {
          try { graph!.fitView(); } catch { /* destroyed */ }
        };
        graph.once('afterlayout', doFit);
        setTimeout(doFit, 2000);  // faster fallback for small graphs
        setTimeout(doFit, 5000);
      }
    }

    init();

    return () => {
      if (graphRef.current) {
        try { graphRef.current.destroy(); } catch { /* already destroyed */ }
        graphRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, focusNodeId, expandedKey]);

  // ── Preset application ──────────────────────────────────────────────
  const activePreset = useStore(state => state.activePreset);
  useEffect(() => {
    if (!ready) return;
    const graph = graphRef.current;
    const graphData = graphDataRef.current;
    if (!graph || !graphData) return;

    // Presets apply style overrides by node ID — aggregate/cluster nodes
    // will simply be skipped (no matching ID in preset data)
    try {
      applyPreset(graph, graphData, activePreset);
    } catch {
      // Preset may reference nodes not in current view — safe to ignore
    }
  }, [activePreset, ready]);

  // ── Keyboard navigation ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'neighborhood') {
          goBack();
        } else {
          setSelectedNode(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, goBack, setSelectedNode]);

  // ── Resize handler ──────────────────────────────────────────────────
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

  // ── Fit-to-screen button handler ────────────────────────────────────
  const handleFitView = useCallback(() => {
    const graph = graphRef.current;
    if (graph) {
      graph.fitView();
    }
  }, []);

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
          {viewMode === 'overview' ? 'Loading overview…' : 'Loading neighborhood…'}
        </div>
      )}
      {/* Fit-to-screen button */}
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
