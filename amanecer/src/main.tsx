import React from 'react';
import ReactDOM from 'react-dom/client';
// Tipografías locales para funcionar 100% sin conexión (§3.1):
// Atkinson Hyperlegible (UI, baja visión) y Bitter (solo saludos/titulares).
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/bitter/600.css';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// PWA offline-first: el service worker se actualiza solo (§11).
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
