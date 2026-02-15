interface ProblemDetailProps {
  data: Record<string, unknown>;
}

export function ProblemDetail({ data }: ProblemDetailProps) {
  const plainLanguage = data.plain_language as string | undefined;
  const scores = data.scores as Record<string, number> | undefined;
  const evidenceTier = data.evidence_tier as number | undefined;
  const cluster = data.cluster as string | undefined;
  const role = data.role as string | undefined;

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

      {scores && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Scores
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
            {scores.frequency !== undefined && (
              <div>Frequency: <strong>{scores.frequency}</strong></div>
            )}
            {scores.differentiation !== undefined && (
              <div>Differentiation: <strong>{scores.differentiation}</strong></div>
            )}
            {scores.connectedness !== undefined && (
              <div>Connectedness: <strong>{scores.connectedness}</strong></div>
            )}
            {scores.total !== undefined && (
              <div style={{ gridColumn: '1 / -1', fontWeight: 600, marginTop: '4px' }}>
                Total: <strong>{scores.total}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
        {evidenceTier !== undefined && (
          <div>
            <span style={{ color: '#525252' }}>Evidence Tier: </span>
            <strong>{evidenceTier}</strong>
          </div>
        )}
        {cluster && (
          <div>
            <span style={{ color: '#525252' }}>Cluster: </span>
            <strong>{cluster}</strong>
          </div>
        )}
      </div>

      {role && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Role
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{role}</div>
        </div>
      )}
    </div>
  );
}
