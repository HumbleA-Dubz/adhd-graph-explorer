import { useEffect, useRef } from 'react';
import { Graph } from '@antv/g6';

/**
 * Phase 1 scaffold: renders a hardcoded test graph to prove the toolchain works.
 * Will be replaced with real data in Phase 3.
 */
export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-init
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    const graph = new Graph({
      container: containerRef.current,
      autoFit: 'view',
      data: {
        nodes: [
          { id: 'fp03', data: { label: 'Time Blindness' }, combo: 'cl_a' },
          { id: 'fp04', data: { label: 'Deadline Misses' }, combo: 'cl_a' },
          { id: 'fp12', data: { label: 'Chronic Lateness' }, combo: 'cl_a' },
          { id: 'mech01', data: { label: 'Time Perception Distortion' } },
          { id: 'm1', data: { label: 'Ambient Monitor' } },
        ],
        edges: [
          { id: 'e1', source: 'fp03', target: 'mech01' },
          { id: 'e2', source: 'fp04', target: 'mech01' },
          { id: 'e3', source: 'mech01', target: 'm1' },
        ],
        combos: [{ id: 'cl_a', data: { label: 'Cluster A — Time-Perception Cascade' } }],
      },
      node: {
        style: {
          labelText: (d: Record<string, unknown>) => {
            const data = d.data as Record<string, unknown> | undefined;
            return (data?.label as string) ?? d.id;
          },
          labelPlacement: 'bottom',
          size: 36,
          fill: '#6929C4',
          stroke: '#fff',
          lineWidth: 2,
        },
      },
      edge: {
        style: {
          stroke: '#C6C6C6',
          lineWidth: 1,
        },
      },
      combo: {
        style: {
          labelText: (d: Record<string, unknown>) => {
            const data = d.data as Record<string, unknown> | undefined;
            return (data?.label as string) ?? d.id;
          },
          fill: '#f0e6ff',
          fillOpacity: 0.15,
          stroke: '#6929C4',
          lineWidth: 1,
          collapsedSize: 40,
        },
      },
      layout: {
        type: 'combo-combined',
        spacing: 20,
        comboPadding: 30,
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    });

    graph.render();
    graphRef.current = graph;

    return () => {
      graph.destroy();
      graphRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
