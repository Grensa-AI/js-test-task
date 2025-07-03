import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

function injectExtension() {
  if (document.getElementById('telegram-extension-root')) return;

  const container = document.createElement('div');
  container.id = 'telegram-extension-root';
  Object.assign(container.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '10000',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });
  document.body.append(container);

  ReactDOM.createRoot(container).render(<App />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectExtension);
} else {
  injectExtension();
}
