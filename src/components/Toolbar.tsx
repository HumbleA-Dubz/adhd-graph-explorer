import { FilterPanel } from './FilterPanel';
import { PresetSelector } from './PresetSelector';

export function Toolbar() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '280px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <FilterPanel />
      <PresetSelector />
    </div>
  );
}
