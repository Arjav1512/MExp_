import { X, Bell, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-surface-container-high"
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <motion.div
          className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center mx-auto mb-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Bell className="w-6 h-6 text-primary" />
        </motion.div>

        <motion.h2
          id="coming-soon-title"
          className="font-headline font-black text-2xl text-primary mb-2 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
        >
          Launching Soon
        </motion.h2>
        <motion.p
          className="text-on-surface-variant text-sm leading-relaxed mb-7 max-w-xs mx-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
        >
          Our store isn't open yet — but we're almost there. Subscribe to get 20% off your first order and be the first to know.
        </motion.p>

        <motion.button
          onClick={() => { onClose(); onSubscribe(); }}
          className="btn-primary w-full py-3.5 text-[15px] justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
          whileTap={{ scale: 0.97 }}
        >
          Notify Me at Launch
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <motion.button
          onClick={onClose}
          className="mt-3 w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.25 }}
          whileTap={{ scale: 0.97 }}
        >
          Maybe later
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
