import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import './index.css';
import { applyServiceWorkerUpdate, registerServiceWorker } from '@/pwa/register-service-worker';
import { appQueryClient } from '@/query-client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={appQueryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

void registerServiceWorker({
  onUpdateAvailable: () => {
    const shouldUpdateNow = window.confirm(
      'A new version is available. Reload now to update the app?'
    );

    if (!shouldUpdateNow) {
      return;
    }

    if (!applyServiceWorkerUpdate()) {
      window.location.reload();
      return;
    }

    let didReload = false;
    const reloadPage = () => {
      if (didReload) {
        return;
      }

      didReload = true;
      window.location.reload();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', reloadPage, { once: true });
    }

    window.setTimeout(reloadPage, 2000);
  },
});
