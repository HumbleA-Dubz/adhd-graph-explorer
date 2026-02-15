import { useStore } from '@/store';
import { TYPE_COLORS, TYPE_LABELS } from '@/theme/palette';
import { EntityBadge } from './EntityBadge';
import { ProblemDetail } from './DetailSections/ProblemDetail';
import { MechanismDetail } from './DetailSections/MechanismDetail';
import { ModelDetail } from './DetailSections/ModelDetail';
import { MetaChallengeDetail } from './DetailSections/MetaChallengeDetail';
import { FoundationDetail } from './DetailSections/FoundationDetail';
import { TechnologyDetail } from './DetailSections/TechnologyDetail';
import { ImplicationDetail } from './DetailSections/ImplicationDetail';
import { GenericDetail } from './DetailSections/GenericDetail';
import type { CanvasEntityType } from '@/pipeline/types';

export function DetailPanel() {
  const selectedNodeId = useStore(state => state.selectedNodeId);
  const setSelectedNode = useStore(state => state.setSelectedNode);
  const getNodeById = useStore(state => state.getNodeById);
  const getEdgesForNode = useStore(state => state.getEdgesForNode);
  const getConnectedNodes = useStore(state => state.getConnectedNodes);

  if (!selectedNodeId) return null;

  const node = getNodeById(selectedNodeId);
  if (!node) return null;

  const edges = getEdgesForNode(selectedNodeId);
  const connectedNodes = getConnectedNodes(selectedNodeId);

  // Group connected nodes by edge type
  const edgeGroups: Record<string, typeof connectedNodes> = {};
  edges.forEach(edge => {
    const connectedId = edge.source === selectedNodeId ? edge.target : edge.source;
    const connectedNode = connectedNodes.find(n => n.id === connectedId);
    if (!connectedNode) return;

    if (!edgeGroups[edge.edgeType]) {
      edgeGroups[edge.edgeType] = [];
    }
    edgeGroups[edge.edgeType]!.push(connectedNode);
  });

  const handleClose = () => {
    setSelectedNode(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const renderDetailSection = () => {
    switch (node.type) {
      case 'problem':
        return <ProblemDetail data={node.data} />;
      case 'mechanism':
        return <MechanismDetail data={node.data} />;
      case 'engagement_model':
        return <ModelDetail data={node.data} />;
      case 'meta_challenge':
        return <MetaChallengeDetail data={node.data} />;
      case 'foundation':
        return <FoundationDetail data={node.data} />;
      case 'technology':
        return <TechnologyDetail data={node.data} />;
      case 'implication':
        return <ImplicationDetail data={node.data} />;
      default:
        return <GenericDetail data={node.data} />;
    }
  };

  const typeColor = TYPE_COLORS[node.type as CanvasEntityType] || '#525252';
  const typeLabel = TYPE_LABELS[node.type as CanvasEntityType] || node.type;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          background: '#ffffff',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: 600,
                color: '#161616',
                lineHeight: '1.3',
              }}
            >
              {node.label}
            </h2>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: '#f4f4f4',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: typeColor,
                }}
              />
              <span style={{ color: '#525252' }}>{typeLabel}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#525252',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Type-specific details */}
          {renderDetailSection()}

          {/* Connected entities */}
          {Object.keys(edgeGroups).length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: '#161616' }}>
                Connected Entities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(edgeGroups).map(([edgeType, nodes]) => (
                  <div key={edgeType}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#525252', marginBottom: '8px' }}>
                      {edgeType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {nodes.map(connectedNode => (
                        <EntityBadge
                          key={connectedNode.id}
                          entityId={connectedNode.id}
                          entityName={connectedNode.label}
                          entityType={connectedNode.type as CanvasEntityType}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
