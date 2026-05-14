import React, { useEffect } from 'react';
import { useUiStore, type ToastType } from '../../stores/ui-store';

const CONFIG: Record<ToastType, { bg: string; icon: React.ReactElement }> = {
  success: {
    bg: 'bg-white border border-success/20',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-light text-success shrink-0">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      </span>
    ),
  },
  error: {
    bg: 'bg-white border border-danger/20',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-light text-danger shrink-0">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </span>
    ),
  },
  info: {
    bg: 'bg-white border border-accent/20',
    icon: (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-light text-accent shrink-0">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
      </span>
    ),
  },
};

interface ToastItemProps { id: string; type: ToastType; message: string; }

const ToastItem = ({ id, type, message }: ToastItemProps) => {
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 3500);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  const { bg, icon } = CONFIG[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm text-text-primary animate-slide-up min-w-[280px] max-w-sm ${bg}`}
    >
      {icon}
      <span className="flex-1 font-medium">{message}</span>
      <button
        type="button"
        onClick={() => removeToast(id)}
        aria-label="닫기"
        className="ml-1 shrink-0 text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

const Toast = () => {
  const toasts = useUiStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-5 z-[100] flex flex-col gap-2" aria-label="알림">
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </div>
  );
};

export default Toast;
