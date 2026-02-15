interface ModelDetailProps {
  data: Record<string, unknown>;
}

export function ModelDetail({ data }: ModelDetailProps) {
  const plainLanguage = data.plain_language as string | undefined;
  const dimensions = data.dimensions as Record<string, string> | undefined;
  const retentionRisk = data.retention_risk as string | undefined;
  const habitBurden = data.habit_burden as string | undefined;

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

      {dimensions && Object.keys(dimensions).length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Dimensions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {dimensions.initiation && (
              <div>
                <span style={{ color: '#525252' }}>Initiation: </span>
                <span>{dimensions.initiation}</span>
              </div>
            )}
            {dimensions.effort && (
              <div>
                <span style={{ color: '#525252' }}>Effort: </span>
                <span>{dimensions.effort}</span>
              </div>
            )}
            {dimensions.timing && (
              <div>
                <span style={{ color: '#525252' }}>Timing: </span>
                <span>{dimensions.timing}</span>
              </div>
            )}
            {dimensions.continuity && (
              <div>
                <span style={{ color: '#525252' }}>Continuity: </span>
                <span>{dimensions.continuity}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        {retentionRisk && (
          <div>
            <span style={{ color: '#525252' }}>Retention Risk: </span>
            <strong>{retentionRisk}</strong>
          </div>
        )}
        {habitBurden && (
          <div>
            <span style={{ color: '#525252' }}>Habit Burden: </span>
            <strong>{habitBurden}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
