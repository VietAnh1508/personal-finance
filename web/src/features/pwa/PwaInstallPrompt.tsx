import { useEffect, useState } from 'react';

type BeforeInstallPromptUserChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptUserChoice>;
};

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  const iOSNavigator = window.navigator as Navigator & { standalone?: boolean };
  const browserStandaloneMode =
    typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;

  return browserStandaloneMode || iOSNavigator.standalone === true;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneMode);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!deferredPrompt || isInstalled) {
    return null;
  }

  async function handleInstallClick() {
    const promptEvent = deferredPrompt;
    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <section
      aria-label="Install app prompt"
      className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-amber-300/40 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 shadow-2xl backdrop-blur">
        <p className="leading-5 text-slate-200">Install Personal Finance for faster home-screen access.</p>
        <button
          className="rounded-md bg-amber-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-amber-200"
          onClick={handleInstallClick}
          type="button">
          Install app
        </button>
      </div>
    </section>
  );
}
