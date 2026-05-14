import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = '삭제',
  confirmVariant = 'danger',
}: ConfirmDialogProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="alertdialog" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-xl animate-scale-in p-6">
        <h2 id="confirm-title" className="text-base font-semibold text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>취소</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
