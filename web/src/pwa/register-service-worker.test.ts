import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyServiceWorkerUpdate, registerServiceWorker } from '@/pwa/register-service-worker';

type ListenerMap = Record<string, EventListener | undefined>;

function createRegistrationMock() {
  const listeners: ListenerMap = {};
  let installingWorker: { state: ServiceWorkerState; addEventListener: (type: string, cb: EventListener) => void } | null = null;

  const registration = {
    installing: null as ServiceWorker | null,
    waiting: null as ServiceWorker | null,
    addEventListener: vi.fn((type: string, cb: EventListener) => {
      listeners[type] = cb;
    }),
    triggerUpdateFound(workerState: ServiceWorkerState) {
      const workerListeners: ListenerMap = {};
      installingWorker = {
        state: workerState,
        addEventListener: (type: string, cb: EventListener) => {
          workerListeners[type] = cb;
        },
      };
      (registration.installing as unknown as object) = installingWorker as unknown as ServiceWorker;
      listeners.updatefound?.(new Event('updatefound'));
      workerListeners.statechange?.(new Event('statechange'));
    },
  } satisfies Partial<ServiceWorkerRegistration> & {
    triggerUpdateFound: (workerState: ServiceWorkerState) => void;
  };

  return registration;
}

describe('registerServiceWorker', () => {
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: originalServiceWorker,
      });
    }
  });

  it('registers service worker in production mode', async () => {
    const registration = createRegistrationMock();
    const register = vi.fn().mockResolvedValue(registration);

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        controller: null,
      },
    });

    await registerServiceWorker({ isProduction: true });

    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('announces update when a new worker installs with an existing controller', async () => {
    const registration = createRegistrationMock();
    const register = vi.fn().mockResolvedValue(registration);
    const onUpdateAvailable = vi.fn();

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        controller: {},
      },
    });

    await registerServiceWorker({
      isProduction: true,
      onUpdateAvailable,
    });

    registration.triggerUpdateFound('installed');

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
  });

  it('posts SKIP_WAITING to waiting worker when applying update', async () => {
    const postMessage = vi.fn();
    const registration = createRegistrationMock();
    registration.waiting = { postMessage } as unknown as ServiceWorker;

    const register = vi.fn().mockResolvedValue(registration);

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        controller: {},
      },
    });

    await registerServiceWorker({ isProduction: true });

    expect(applyServiceWorkerUpdate()).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
