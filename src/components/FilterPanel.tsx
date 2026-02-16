import { useState } from 'react';
import { useStore } from '@/store';
import { TYPE_COLORS, TYPE_LABELS } from '@/theme/palette';
import type { CanvasEntityType } from '@/pipeline/types';

const CLUSTER_LABELS: Record<string, string> = {
  CL_A: 'Cluster A',
  CL_B: 'Cluster B',
  CL_C: 'Cluster C',
};

export function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const viewMode = useStore(state => state.viewMode);
  const focusNodeId = useStore(state => state.focusNodeId);
  const expandedGroups = useStore(state => state.expandedGroups);
  const expandGroup = useStore(state => state.expandGroup);
  const collapseGroup = useStore(state => state.collapseGroup);
  const getNeighborhoodData = useStore(state => state.getNeighborhoodData);

  // In neighborhood mode, show what type groups are present
  const neighborhoodTypes: { type: CanvasEntityType; count: number }[] = [];
  if (viewMode === 'neighborhood' && focusNodeId) {
    const data = getNeighborhoodData(focusNodeId);
    if (data) {
      for (const [type, nodes] of data.neighborsByType) {
        neighborhoodTypes.push({ type, count: nodes.length });
      }
      // Sort by count descending
      neighborhoodTypes.sort((a, b) => b.count - a.count);
    }
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#f4f4f4',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 600,
          color: '#161616',
        }}
      >
        <span>{viewMode === 'overview' ? 'Legend' : 'Neighbors'}</span>
        <span style={{ color: '#525252', fontSize: '11px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {viewMode === 'overview' ? (
            /* ── Overview mode: show legend of what's on screen ── */
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#525252', marginBottom: '10px' }}>
                Overview Nodes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Clusters */}
                {Object.entries(CLUSTER_LABELS).map(([clusterId, label]) => (
                  <div
                    key={clusterId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '8px',
                        borderRadius: '2px',
                        background: '#6929C4',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: '#161616' }}>{label}</span>
                  </div>
                ))}
                {/* Mechanisms */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    marginTop: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: TYPE_COLORS['mechanism'],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#161616' }}>Mechanisms (6)</span>
                </div>
              </div>
              <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: '#8d8d8d',
                lineHeight: '1.4',
              }}>
                Click a node to explore its neighborhood
              </div>
            </div>
          ) : (
            /* ── Neighborhood mode: show neighbor type groups ── */
            <div>
              {neighborhoodTypes.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#8d8d8d' }}>
                  No neighbors to display
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#525252', marginBottom: '10px' }}>
                    Neighbor Groups
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {neighborhoodTypes.map(({ type, count }) => {
                      const isGroupExpanded = expandedGroups.has(type);
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            if (isGroupExpanded) {
                              collapseGroup(type);
                            } else {
                              expandGroup(type);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            background: isGroupExpanded ? '#e8e8e8' : 'transparent',
                            border: '1px solid',
                            borderColor: isGroupExpanded ? '#c6c6c6' : 'transparent',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            width: '100%',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => {
                            if (!isGroupExpanded) {
                              e.currentTarget.style.background = '#f4f4f4';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isGroupExpanded) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: TYPE_COLORS[type] ?? '#8d8d8d',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ color: '#161616', flex: 1 }}>
                            {TYPE_LABELS[type] ?? type}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: '#525252',
                            background: '#e0e0e0',
                            borderRadius: '10px',
                            padding: '1px 7px',
                            fontWeight: 500,
                          }}>
                            {count}
                          </span>
                          <span style={{ fontSize: '10px', color: '#8d8d8d' }}>
                            {isGroupExpanded ? '▼' : '▶'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#8d8d8d',
                    lineHeight: '1.4',
                  }}>
                    Click to expand/collapse groups
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
