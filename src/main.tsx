import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Safely suppress benign ResizeObserver loop limit warnings triggered by browser chart layouts
if (typeof window !== 'undefined') {
  const resizeObserverErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications.'
  ];

  window.addEventListener('error', (e) => {
    if (e && resizeObserverErrors.some(msg => e.message && e.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (e && e.reason && e.reason.message && resizeObserverErrors.some(msg => e.reason.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  // Globally debounce ResizeObserver callbacks inside requestAnimationFrame to completely prevent loop errors
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
    constructor(callback: any) {
      super((entries, observer) => {
        requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
