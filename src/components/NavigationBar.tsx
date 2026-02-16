import { useStore } from '@/store';

export function NavigationBar() {
  const viewMode = useStore(state => state.viewMode);
  const focusNodeId = useStore(state => state.focusNodeId);
  const navigationHistory = useStore(state => state.navigationHistory);
  const goBack = useStore(state => state.goBack);
  const goToOverview = useStore(state => state.goToOverview);
  const getNodeById = useStore(state => state.getNodeById);

  if (viewMode !== 'neighborhood' || !focusNodeId) return null;

  // Build breadcrumb segments
  const segments: { label: string; onClick: () => void }[] = [];

  // "Overview" is always first
  segments.push({
    label: 'Overview',
    onClick: goToOverview,
  });

  // History entries
  for (const histNodeId of navigationHistory) {
    const node = getNodeById(histNodeId);
    const label = node?.label ?? histNodeId;
    segments.push({
      label: truncate(label, 20),
      onClick: () => {
        const store = useStore.getState();
        const idx = store.navigationHistory.indexOf(histNodeId);
        if (idx >= 0) {
          useStore.setState({
            focusNodeId: histNodeId,
            navigationHistory: store.navigationHistory.slice(0, idx),
            expandedGroups: new Set(),
            selectedNodeId: null,
          });
        }
      },
    });
  }

  // Current focus node (not clickable)
  const currentNode = getNodeById(focusNodeId);
  const currentLabel = currentNode?.label ?? focusNodeId;

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '8px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        maxWidth: '80vw',
        overflow: 'hidden',
      }}
    >
      {/* Back button */}
      <button
        onClick={goBack}
        title="Go back (Esc)"
        style={{
          background: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '14px',
          color: '#525252',
          marginRight: '8px',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f4f4f4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        ←
      </button>

      {/* Breadcrumb */}
      {segments.map((seg, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={seg.onClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0f62fe',
              fontSize: '13px',
              padding: '2px 4px',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            {seg.label}
          </button>
          <span style={{ color: '#a8a8a8' }}>/</span>
        </span>
      ))}

      {/* Current node (not a link) */}
      <span style={{ color: '#161616', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {truncate(currentLabel, 30)}
      </span>
    </div>
  );
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}
