import { useStore } from '@/store';
import { TYPE_COLORS, TYPE_LABELS } from '@/theme/palette';
import type { CanvasEntityType } from '@/pipeline/types';

interface EntityBadgeProps {
  entityId: string;
  entityName: string;
  entityType: CanvasEntityType;
}

export function EntityBadge({ entityId, entityName, entityType }: EntityBadgeProps) {
  const setSelectedNode = useStore(state => state.setSelectedNode);

  const handleClick = () => {
    setSelectedNode(entityId);
  };

  const color = TYPE_COLORS[entityType];
  const typeLabel = TYPE_LABELS[entityType];

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        background: '#f4f4f4',
        cursor: 'pointer',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e0e0e0';
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f4f4f4';
        e.currentTarget.style.borderColor = '#e0e0e0';
      }}
      title={typeLabel}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ color: '#161616' }}>{entityName}</span>
    </button>
  );
}
