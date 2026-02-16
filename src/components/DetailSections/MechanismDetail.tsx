interface MechanismDetailProps {
  data: Record<string, unknown>;
}

export function MechanismDetail({ data }: MechanismDetailProps) {
  const plainLanguage = data.plain_language as string | undefined;
  const variability = data.variability as string | undefined;
  const rawDoesNotExplain = data.does_not_explain;
  const doesNotExplain = Array.isArray(rawDoesNotExplain)
    ? rawDoesNotExplain as string[]
    : typeof rawDoesNotExplain === 'string'
      ? [rawDoesNotExplain]
      : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {plainLanguage && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Description
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#161616' }}>
            {plainLanguage}
          </div>
        </div>
      )}

      {variability && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Variability
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{variability}</div>
        </div>
      )}

      {doesNotExplain && doesNotExplain.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Does Not Explain
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#161616' }}>
            {doesNotExplain.map((item, i) => (
              <li key={i}>{String(item)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
