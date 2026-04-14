import { X, Bell, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ComingSoonModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export function ComingSoonModal({ onClose, onSubscribe }: ComingSoonModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-scale-in border border-surface-container-high">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center mx-auto mb-5">
          <Bell className="w-6 h-6 text-primary" />
        </div>

        <h2 id="coming-soon-title" className="font-headline font-black text-2xl text-primary mb-2 leading-tight tracking-tight">
          Launching Soon
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-7 max-w-xs mx-auto">
          Our store isn't open yet — but we're almost there. Subscribe to get 20% off your first order and be the first to know.
        </p>

        <button
          onClick={() => { onClose(); onSubscribe(); }}
          className="btn-primary w-full py-3.5 text-[15px] justify-center"
        >
          Notify Me at Launch
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
