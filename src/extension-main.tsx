import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.tsx';

// Theme init (inline script from index.html is omitted in extension pages for stricter CSP compatibility)
(function initThemeFromStorage() {
  try {
    const raw = localStorage.getItem('garry-micro-dev-utilities-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = raw ? raw === '"dark"' : prefersDark;
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    /* ignore */
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
