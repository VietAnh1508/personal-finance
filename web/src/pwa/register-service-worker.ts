export type RegisterServiceWorkerOptions = {
  isProduction?: boolean;
  onOfflineReady?: () => void;
  onUpdateAvailable?: () => void;
};

let currentServiceWorkerRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(options: RegisterServiceWorkerOptions = {}) {
  const {
    isProduction = import.meta.env.PROD,
    onOfflineReady,
    onUpdateAvailable,
  } = options;

  if (!isProduction || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    currentServiceWorkerRegistration = registration;

    if (registration.waiting) {
      onUpdateAvailable?.();
    }

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;

      if (!installingWorker) {
        return;
      }

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state !== 'installed') {
          return;
        }

        if (navigator.serviceWorker.controller) {
          onUpdateAvailable?.();
          return;
        }

        onOfflineReady?.();
      });
    });

    return registration;
  } catch (error) {
    console.error('Service worker registration failed.', error);
    return null;
  }
}

export function applyServiceWorkerUpdate() {
  if (!currentServiceWorkerRegistration?.waiting) {
    return false;
  }

  currentServiceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
}
