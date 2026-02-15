import { GraphCanvas } from './components/GraphCanvas';

export default function App() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Toolbar will go on the left */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphCanvas />
      </div>
      {/* Detail panel will go on the right */}
    </div>
  );
}
