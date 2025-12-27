import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

/**
 * Toast system for displaying notifications
 * Uses Radix UI Toast primitive with Midnight Command styling
 */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open={true}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            duration={toast.duration}
            className="rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: toast.type === 'success'
                ? 'var(--approve)'
                : toast.type === 'error'
                  ? 'var(--kill)'
                  : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--approve)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--kill)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <ToastPrimitive.Description
                className="text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {toast.message}
              </ToastPrimitive.Description>
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col p-4 gap-2 md:max-w-[420px]"
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
