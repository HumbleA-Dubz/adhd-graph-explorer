import { useState } from 'react';

interface TechnologyDetailProps {
  data: Record<string, unknown>;
}

interface Approach {
  name: string;
  known_requirements?: string[];
  known_challenges?: string[];
  accelerators?: string[];
}

export function TechnologyDetail({ data }: TechnologyDetailProps) {
  const name = data.name as string | undefined;
  const servesCapability = data.serves_capability as string | undefined;
  const architecturalScope = data.architectural_scope as string | undefined;
  const integrationSurface = data.integration_surface as string | undefined;
  const technologyStake = data.technology_stake as string | undefined;
  const remainingUncertainty = data.remaining_uncertainty as string | undefined;
  const approaches = data.approaches as Approach[] | undefined;

  const [expandedApproach, setExpandedApproach] = useState<number | null>(null);

  const toggleApproach = (index: number) => {
    setExpandedApproach(expandedApproach === index ? null : index);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {name && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Name
          </div>
          <div style={{ fontSize: '14px', color: '#161616' }}>{name}</div>
        </div>
      )}

      {servesCapability && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Serves Capability
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{servesCapability}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
        {architecturalScope && (
          <div>
            <span style={{ color: '#525252' }}>Architectural Scope: </span>
            <span>{architecturalScope}</span>
          </div>
        )}
        {integrationSurface && (
          <div>
            <span style={{ color: '#525252' }}>Integration Surface: </span>
            <span>{integrationSurface}</span>
          </div>
        )}
        {technologyStake && (
          <div>
            <span style={{ color: '#525252' }}>Technology Stake: </span>
            <span>{technologyStake}</span>
          </div>
        )}
      </div>

      {remainingUncertainty && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '6px' }}>
            Remaining Uncertainty
          </div>
          <div style={{ fontSize: '13px', color: '#161616' }}>{remainingUncertainty}</div>
        </div>
      )}

      {approaches && approaches.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: '#525252', marginBottom: '8px' }}>
            Approaches
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {approaches.map((approach, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleApproach(index)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: expandedApproach === index ? '#f4f4f4' : '#ffffff',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#161616',
                  }}
                >
                  <span>{approach.name}</span>
                  <span style={{ color: '#525252', fontSize: '11px' }}>
                    {expandedApproach === index ? '▼' : '▶'}
                  </span>
                </button>
                {expandedApproach === index && (
                  <div style={{ padding: '12px', background: '#f4f4f4', fontSize: '12px' }}>
                    {approach.known_requirements && approach.known_requirements.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#525252' }}>
                          Known Requirements
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {approach.known_requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {approach.known_challenges && approach.known_challenges.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#525252' }}>
                          Known Challenges
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {approach.known_challenges.map((challenge, i) => (
                            <li key={i}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {approach.accelerators && approach.accelerators.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#525252' }}>
                          Accelerators
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {approach.accelerators.map((acc, i) => (
                            <li key={i}>{acc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
