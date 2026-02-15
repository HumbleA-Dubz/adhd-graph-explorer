import { useState } from 'react';
import { useStore } from '@/store';
import { TYPE_COLORS, TYPE_LABELS } from '@/theme/palette';
import { CANVAS_ENTITY_TYPES } from '@/pipeline/types';

const CLUSTER_LABELS: Record<string, string> = {
  CL_A: 'Cluster A',
  CL_B: 'Cluster B',
  CL_C: 'Cluster C',
};

export function FilterPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const visibleEntityTypes = useStore(state => state.visibleEntityTypes);
  const toggleEntityType = useStore(state => state.toggleEntityType);
  const visibleClusters = useStore(state => state.visibleClusters);
  const toggleCluster = useStore(state => state.toggleCluster);

  const handleToggleAll = (section: 'types' | 'clusters', enable: boolean) => {
    if (section === 'types') {
      CANVAS_ENTITY_TYPES.forEach(type => {
        const isVisible = visibleEntityTypes.has(type);
        if (enable && !isVisible) toggleEntityType(type);
        if (!enable && isVisible) toggleEntityType(type);
      });
    } else {
      Object.keys(CLUSTER_LABELS).forEach(clusterId => {
        const isVisible = visibleClusters.has(clusterId);
        if (enable && !isVisible) toggleCluster(clusterId);
        if (!enable && isVisible) toggleCluster(clusterId);
      });
    }
  };

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
        <span>Filters</span>
        <span style={{ color: '#525252', fontSize: '11px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* Entity Types Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#525252' }}>
                Entity Types
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleAll('types', true)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    background: 'none',
                    border: '1px solid #c6c6c6',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#525252',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => handleToggleAll('types', false)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    background: 'none',
                    border: '1px solid #c6c6c6',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#525252',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  None
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CANVAS_ENTITY_TYPES.map(type => (
                <label
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleEntityTypes.has(type)}
                    onChange={() => toggleEntityType(type)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: TYPE_COLORS[type],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#161616' }}>{TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clusters Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#525252' }}>
                Clusters
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleAll('clusters', true)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    background: 'none',
                    border: '1px solid #c6c6c6',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#525252',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => handleToggleAll('clusters', false)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    background: 'none',
                    border: '1px solid #c6c6c6',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#525252',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  None
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(CLUSTER_LABELS).map(([clusterId, label]) => (
                <label
                  key={clusterId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleClusters.has(clusterId)}
                    onChange={() => toggleCluster(clusterId)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#161616' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
