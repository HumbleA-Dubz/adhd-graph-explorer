/**
 * Virtual aggregate node system for neighborhood mode.
 *
 * When a focus node has many neighbors of the same type, we group them
 * into a single "aggregate" node (e.g. "5 Problems") that can be expanded.
 */
import type { NodeData, EdgeData } from '@antv/g6';
import type { CanvasEntityType, CanvasNode, GraphEdge } from '@/pipeline/types';
import { TYPE_LABELS } from '@/theme/palette';

/** Prefix for aggregate node IDs to distinguish them from real nodes */
export const AGG_PREFIX = 'agg_';

/** Check if a node ID is an aggregate node */
export function isAggregateNode(nodeId: string): boolean {
  return nodeId.startsWith(AGG_PREFIX);
}

/** Extract the entity type from an aggregate node ID */
export function getAggregateType(nodeId: string): CanvasEntityType | null {
  if (!isAggregateNode(nodeId)) return null;
  return nodeId.slice(AGG_PREFIX.length) as CanvasEntityType;
}

/**
 * Build G6-ready graph data for a neighborhood view.
 *
 * - Center node is always shown as itself (large, prominent)
 * - For each entity type with neighbors:
 *   - If count=1 or type is in expandedGroups → show individual nodes
 *   - If count>1 and type NOT expanded → show one aggregate node
 * - Edges connect to center: one per aggregate, or individual if expanded
 */
export function buildNeighborhoodGraph(
  center: CanvasNode,
  neighborsByType: Map<CanvasEntityType, CanvasNode[]>,
  edges: GraphEdge[],
  expandedGroups: Set<string>,
): { nodes: NodeData[]; edges: EdgeData[] } {
  const nodes: NodeData[] = [];
  const g6Edges: EdgeData[] = [];

  // Center node — larger and marked as center
  nodes.push({
    id: center.id,
    data: {
      ...center.data,
      entityType: center.type,
      label: center.label,
      isCenter: true,
      isConvergencePoint: center.isConvergencePoint ?? false,
    },
  });

  // Process each type group
  for (const [entityType, neighbors] of neighborsByType) {
    const isExpanded = expandedGroups.has(entityType);
    const isSingle = neighbors.length === 1;

    if (isSingle || isExpanded) {
      // Show individual nodes
      for (const neighbor of neighbors) {
        nodes.push({
          id: neighbor.id,
          data: {
            ...neighbor.data,
            entityType: neighbor.type,
            label: neighbor.label,
            isConvergencePoint: neighbor.isConvergencePoint ?? false,
          },
        });

        // Find real edges between center and this neighbor
        const connectingEdges = edges.filter(e =>
          (e.source === center.id && e.target === neighbor.id) ||
          (e.source === neighbor.id && e.target === center.id)
        );
        for (const edge of connectingEdges) {
          g6Edges.push({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            data: {
              ...edge.data,
              edgeType: edge.edgeType,
            },
          });
        }
      }
    } else {
      // Show aggregate node
      const aggId = `${AGG_PREFIX}${entityType}`;
      nodes.push(createAggregateNodeData(aggId, entityType, neighbors.length));

      // Single synthetic edge from center to aggregate
      g6Edges.push({
        id: `edge_${center.id}_${aggId}`,
        source: center.id,
        target: aggId,
        data: {
          edgeType: 'aggregate',
          label: '',
        },
      });
    }
  }

  return { nodes, edges: g6Edges };
}

/** Create G6 NodeData for an aggregate node */
function createAggregateNodeData(
  id: string,
  entityType: CanvasEntityType,
  count: number,
): NodeData {
  const typeLabel = TYPE_LABELS[entityType] ?? entityType;
  const plural = count !== 1 ? 's' : '';

  return {
    id,
    data: {
      entityType,
      label: `${count} ${typeLabel}${plural}`,
      isAggregate: true,
      aggregateCount: count,
      aggregateType: entityType,
    },
  };
}

/**
 * Build G6-ready graph data for overview mode.
 * Clusters become virtual nodes; mechanisms are real nodes.
 */
export function buildOverviewGraph(
  clusterNodes: { id: string; label: string; hub: string; memberCount: number }[],
  mechanismNodes: CanvasNode[],
  clusterMechanismEdges: { source: string; target: string; edgeType: string }[],
): { nodes: NodeData[]; edges: EdgeData[] } {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  // Cluster virtual nodes
  for (const cluster of clusterNodes) {
    nodes.push({
      id: cluster.id,
      data: {
        entityType: 'cluster',
        label: cluster.label.replace(/^Cluster [A-Z] — /, ''),
        isClusterNode: true,
        hub: cluster.hub,
        memberCount: cluster.memberCount,
        fullLabel: cluster.label,
      },
    });
  }

  // Mechanism nodes
  for (const mech of mechanismNodes) {
    nodes.push({
      id: mech.id,
      data: {
        ...mech.data,
        entityType: mech.type,
        label: mech.label,
        isConvergencePoint: mech.isConvergencePoint ?? false,
      },
    });
  }

  // Cluster → mechanism edges
  for (const edge of clusterMechanismEdges) {
    edges.push({
      id: `overview_${edge.source}_${edge.target}`,
      source: edge.source,
      target: edge.target,
      data: {
        edgeType: edge.edgeType,
        label: '',
      },
    });
  }

  return { nodes, edges };
}
