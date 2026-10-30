import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isBusy?: boolean;
}

export function Modal({ title, children, onClose, isBusy = false }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={isBusy}
      onCancel={(event) => {
        event.preventDefault();
        if (!isBusy) onClose();
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={titleId} className="text-xl font-semibold text-slate-900">
          {title}
        </h2>
        <Button type="button" variant="secondary" size="sm" disabled={isBusy} onClick={onClose}>
          Close
        </Button>
      </div>
      {children}
    </dialog>
  );
}
