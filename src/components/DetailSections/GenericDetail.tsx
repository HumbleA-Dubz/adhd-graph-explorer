interface GenericDetailProps {
  data: Record<string, unknown>;
}

export function GenericDetail({ data }: GenericDetailProps) {
  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '4px' }}>
            {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </div>
          <div style={{ fontSize: '13px', color: '#161616', whiteSpace: 'pre-wrap' }}>
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
