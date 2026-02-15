interface MetaChallengeDetailProps {
  data: Record<string, unknown>;
}

export function MetaChallengeDetail({ data }: MetaChallengeDetailProps) {
  const plainLanguage = data.plain_language as string | undefined;
  const severity = data.severity as string | undefined;
  const evidenceTier = data.evidence_tier as number | undefined;
  const keyEvidence = data.key_evidence as string | undefined;

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

      <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
        {severity && (
          <div>
            <span style={{ color: '#525252' }}>Severity: </span>
            <strong>{severity}</strong>
          </div>
        )}
        {evidenceTier !== undefined && (
          <div>
            <span style={{ color: '#525252' }}>Evidence Tier: </span>
            <strong>{evidenceTier}</strong>
          </div>
        )}
      </div>

      {keyEvidence && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Key Evidence
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#161616' }}>
            {keyEvidence}
          </div>
        </div>
      )}
    </div>
  );
}
