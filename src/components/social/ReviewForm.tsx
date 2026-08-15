import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, AlertCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { StarPicker } from './StarRating';
import { submitReview } from '../../lib/reviews';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  productSlug?: string;
  onSubmitted: () => void;
}

export function ReviewForm({ open, onClose, productSlug, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ message: string } | null>(null);

  const reset = () => {
    setRating(0); setName(''); setTitle(''); setBody('');
    setShowVerify(false); setOrderNumber(''); setAccessToken('');
    setError(''); setSubmitting(false); setDone(null);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rating < 1) { setError('Please choose a star rating.'); return; }
    if (name.trim().length < 2) { setError('Please enter your name.'); return; }
    if (body.trim().length < 10) { setError('Please write at least a few words about your experience.'); return; }

    setSubmitting(true);
    const result = await submitReview({
      customer_name: name.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
      product_slug: productSlug,
      order_number: orderNumber.trim() || undefined,
      access_token: accessToken.trim() || undefined,
    });
    setSubmitting(false);

    if (result.ok) {
      setDone({ message: result.message });
      onSubmitted();
    } else {
      setError(result.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <motion.div
            className="relative bg-surface-container-lowest w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-surface-container-high max-h-[92vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Write a review"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {done ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-on-primary" />
                </div>
                <h3 className="font-headline font-black text-xl text-primary mb-2">Thank you!</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{done.message}</p>
                <button className="btn-primary" onClick={close}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <h3 className="font-headline font-black text-xl text-on-surface mb-1">Write a review</h3>
                <p className="text-sm text-on-surface-variant mb-5">
                  Share your honest experience. Reviews appear after a quick check.
                </p>

                <div className="mb-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Your rating</span>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                <label className="block mb-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Your name</span>
                  <input className="input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Priya S." />
                </label>

                <label className="block mb-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Headline <span className="font-normal text-on-surface-variant/70">(optional)</span></span>
                  <input className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Deliciously fresh!" />
                </label>

                <label className="block mb-4">
                  <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Your review</span>
                  <textarea
                    className="input min-h-[110px] resize-y"
                    value={body}
                    maxLength={2000}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell us what you loved about your makhana…"
                  />
                  <span className="block text-right text-[11px] text-on-surface-variant/70 mt-1">{body.length}/2000</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowVerify((v) => !v)}
                  className="flex items-center gap-2 text-sm font-bold text-primary mb-3"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Ordered from us? Get a Verified Purchase badge
                  <ChevronDown className={`w-4 h-4 transition-transform ${showVerify ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showVerify && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 pt-1">
                        <label className="block">
                          <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Order number</span>
                          <input className="input" value={orderNumber} maxLength={40} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ME-XXXXXX" />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Order code</span>
                          <input className="input" value={accessToken} maxLength={128} onChange={(e) => setAccessToken(e.target.value)} placeholder="From your confirmation" />
                        </label>
                      </div>
                      <p className="text-[11px] text-on-surface-variant/80 mb-2 leading-relaxed">
                        Find these on your order confirmation. We use them only to confirm your purchase — they're never shown publicly.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-error bg-error-container rounded-lg px-3 py-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>) : 'Submit review'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
