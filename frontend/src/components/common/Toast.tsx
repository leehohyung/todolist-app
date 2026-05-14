import { useEffect } from 'react';
import { useUiStore, type ToastType } from '../../stores/ui-store';

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLORS: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-danger text-white',
  info: 'bg-accent text-white',
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
}

const ToastItem = ({ id, type, message }: ToastItemProps) => {
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 3000);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-md text-sm font-medium animate-slide-up min-w-[240px] max-w-xs ${COLORS[type]}`}
    >
      <span aria-hidden="true" className="text-base font-bold shrink-0">
        {ICONS[type]}
      </span>
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => removeToast(id)}
        aria-label="토스트 닫기"
        className="ml-2 shrink-0 opacity-80 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

const Toast = () => {
  const toasts = useUiStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2"
      aria-label="알림"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
};

export default Toast;
