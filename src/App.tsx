import { GraphCanvas } from './components/GraphCanvas';
import { Toolbar } from './components/Toolbar';
import { DetailPanel } from './components/DetailPanel';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Graph canvas fills the entire viewport */}
      <GraphCanvas />

      {/* Toolbar overlays top-left: FilterPanel + PresetSelector */}
      <Toolbar />

      {/* Detail panel slides in from the right when a node is selected */}
      <DetailPanel />
    </div>
  );
}
