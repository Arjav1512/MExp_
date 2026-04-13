import { X, Bell } from 'lucide-react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-scale-in">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-tertiary-container flex items-center justify-center mx-auto mb-5">
          <Bell className="w-6 h-6 text-on-tertiary-container" />
        </div>

        <h2 id="coming-soon-title" className="font-headline font-black text-2xl text-primary mb-2 leading-tight">
          Launching Soon
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          Our store is not open yet, but we're almost there. Subscribe below to get 20% off your first order and be the first to know when we launch.
        </p>

        <button
          onClick={() => { onClose(); onSubscribe(); }}
          className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:scale-105 transition-transform text-sm"
        >
          Notify Me at Launch
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
