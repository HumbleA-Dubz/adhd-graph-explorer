interface FoundationDetailProps {
  data: Record<string, unknown>;
}

export function FoundationDetail({ data }: FoundationDetailProps) {
  const purpose = data.purpose as string | undefined;
  const technologyRef = data.technology_ref as string | undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {purpose && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Purpose
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#161616' }}>
            {purpose}
          </div>
        </div>
      )}

      {technologyRef && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Technology Reference
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{technologyRef}</div>
        </div>
      )}
    </div>
  );
}
