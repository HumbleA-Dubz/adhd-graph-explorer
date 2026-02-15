import ReactDOM from 'react-dom/client';
import App from './App';

// G6 is an imperative graph library that doesn't tolerate React StrictMode's
// double-mount/unmount cycle — it creates duplicate canvas elements and throws
// errors from destroyed instances. Render without StrictMode.
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
