import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handlers to catch any uncaught errors
window.addEventListener('error', (e) => {
  document.getElementById('root')!.innerHTML =
    `<pre style="padding:40px;color:red;font-size:14px;white-space:pre-wrap;">UNCAUGHT ERROR:\n${e.message}\n\n${e.filename}:${e.lineno}:${e.colno}</pre>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.getElementById('root')!.innerHTML =
    `<pre style="padding:40px;color:red;font-size:14px;white-space:pre-wrap;">UNHANDLED PROMISE REJECTION:\n${e.reason?.message || e.reason}\n\n${e.reason?.stack || ''}</pre>`;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
