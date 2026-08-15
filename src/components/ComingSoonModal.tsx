import { X, Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariant, backdropVariant, hoverScale } from '../lib/motion';

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
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        />
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
          variants={modalVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Close"
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.18 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          <motion.div
            className="w-14 h-14 rounded-full bg-tertiary-container flex items-center justify-center mx-auto mb-5"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 20 }}
          >
            <motion.span
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
            >
              <Bell className="w-6 h-6 text-on-tertiary-container" />
            </motion.span>
          </motion.div>

          <motion.h2
            id="coming-soon-title"
            className="font-headline font-black text-2xl text-primary mb-2 leading-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            Launching Soon
          </motion.h2>

          <motion.p
            className="text-on-surface-variant text-sm leading-relaxed mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27, duration: 0.35 }}
          >
            Our store is not open yet, but we're almost there. Subscribe below to get 20% off your first order and be the first to know when we launch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33, duration: 0.35 }}
          >
            <motion.button
              onClick={() => { onClose(); onSubscribe(); }}
              className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl text-sm"
              {...hoverScale}
            >
              Notify Me at Launch
            </motion.button>
            <motion.button
              onClick={onClose}
              className="mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors block w-full"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15 }}
            >
              Maybe later
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
