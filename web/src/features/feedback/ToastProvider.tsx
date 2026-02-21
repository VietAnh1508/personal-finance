import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const TOAST_DURATION_MS = 3000;

export type ToastType = 'success' | 'error';

type ToastInput = {
  type: ToastType;
  message: string;
};

type ToastState = ToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === toast.id ? null : currentToast));
    }, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast: (nextToast) => {
        setToast({
          ...nextToast,
          id: Date.now(),
        });
      },
    }),
    []
  );

  const toastClasses =
    toast?.type === 'success'
      ? 'border-emerald-300/50 bg-emerald-400/15 text-emerald-100'
      : 'border-rose-300/50 bg-rose-400/15 text-rose-100';

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        {toast ? (
          <div
            className={`max-w-md rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${toastClasses}`}
            role={toast.type === 'error' ? 'alert' : 'status'}>
            {toast.message}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
