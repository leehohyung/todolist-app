import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = '삭제',
}: ConfirmDialogProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-lg shadow-lg animate-slide-up p-6">
        <h2 id="confirm-title" className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h2>
        <p id="confirm-message" className="text-sm text-text-secondary mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
