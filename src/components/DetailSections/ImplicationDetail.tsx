interface ImplicationDetailProps {
  data: Record<string, unknown>;
}

export function ImplicationDetail({ data }: ImplicationDetailProps) {
  const statement = data.statement as string | undefined;
  const type = data.type as string | undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {statement && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Statement
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#161616' }}>
            {statement}
          </div>
        </div>
      )}

      {type && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Type
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{type}</div>
        </div>
      )}
    </div>
  );
}
