import { useState } from 'react';
import { useStore, type PresetName } from '@/store';

interface PresetOption {
  id: PresetName;
  label: string;
  description: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Standard view with type-based colors',
  },
  {
    id: 'evidence',
    label: 'Evidence Strength',
    description: 'Color nodes by evidence tier (darker = stronger evidence)',
  },
  {
    id: 'impact',
    label: 'Impact',
    description: 'Size nodes by problem severity and total score',
  },
  {
    id: 'mechanisms',
    label: 'Mechanisms',
    description: 'Highlight shared mechanisms and their connections',
  },
  {
    id: 'compatibility',
    label: 'Compatibility',
    description: 'Color edges by compatibility ratings (S/P/X)',
  },
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Emphasize foundation-technology relationships',
  },
  {
    id: 'vulnerability',
    label: 'Vulnerability',
    description: 'Show vulnerability ratings (H/M/L)',
  },
];

export function PresetSelector() {
  const [isExpanded, setIsExpanded] = useState(true);
  const activePreset = useStore(state => state.activePreset);
  const setActivePreset = useStore(state => state.setActivePreset);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#f4f4f4',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 600,
          color: '#161616',
        }}
      >
        <span>Visual Encoding</span>
        <span style={{ color: '#525252', fontSize: '11px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PRESETS.map(preset => (
              <label
                key={preset.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '4px',
                  background: activePreset === preset.id ? '#f4f4f4' : 'transparent',
                  border: activePreset === preset.id ? '1px solid #0f62fe' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (activePreset !== preset.id) {
                    e.currentTarget.style.background = '#f4f4f4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePreset !== preset.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                title={preset.description}
              >
                <input
                  type="radio"
                  name="preset"
                  value={preset.id}
                  checked={activePreset === preset.id}
                  onChange={() => setActivePreset(preset.id)}
                  style={{ cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#161616', marginBottom: '2px' }}>
                    {preset.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#525252', lineHeight: '1.4' }}>
                    {preset.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
