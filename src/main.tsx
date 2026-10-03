import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR websocket disconnection notices in container sandboxes
if (typeof window !== 'undefined') {
  const isWsError = (err: unknown) => {
    const msg = String((err as { message?: string })?.message || err || '');
    return msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('[vite]');
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isWsError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      if (isWsError(event.error) || isWsError(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
