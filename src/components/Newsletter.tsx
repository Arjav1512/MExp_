import { CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { hoverScale, viewportOnce } from '../lib/motion';

const RATE_LIMIT_MS = 60_000;

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const lastSubmitRef = useRef<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setStatus('success');
      setMessage('Check your inbox — your 20% off coupon is on its way!');
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      setStatus('error');
      setMessage('Please wait a moment before trying again.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    lastSubmitRef.current = now;
    setStatus('loading');
    trackEvent('newsletter_submit');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, source: 'homepage' }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('error');
          setMessage('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        const emailRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json().catch(() => ({}));
          console.error('Email send failed:', errData);
        }

        trackEvent('newsletter_success');
        setStatus('success');
        setMessage('Check your inbox — your 20% off coupon is on its way!');
        setEmail('');

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      trackEvent('newsletter_error');
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <section id="newsletter" className="py-12 px-8">
      <motion.div
        className="max-w-[1200px] mx-auto bg-primary rounded-xl overflow-hidden relative"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-text-overlay opacity-5 overflow-hidden flex items-center justify-center">
          <span className="text-[20vw] font-black text-white leading-none">EXPRESS</span>
        </div>

        <div className="relative z-10 px-8 py-10 text-center flex flex-col items-center">
          <motion.h2
            style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}
            className="font-headline font-black text-on-primary mb-3 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            From Pond To Pack,
            <br /> Done Right
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-on-primary/80 mb-6 max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            Join our journey and get 20% off on your first order. Authentic makhana, crafted with
            care.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3 w-full max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
            />
            {status === 'loading' ? (
              <div className="flex-grow h-[50px] rounded-xl newsletter-skeleton" aria-hidden="true" />
            ) : (
              <>
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <motion.input
                  id="newsletter-email"
                  className="appearance-none flex-grow bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3 rounded-xl focus:ring-2 focus:ring-primary-fixed focus:border-transparent focus:outline-none text-base"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  whileFocus={{ scale: 1.01, borderColor: 'rgba(188, 240, 174, 0.6)' }}
                  transition={{ duration: 0.15 }}
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                />
              </>
            )}
            {status === 'loading' ? (
              <div className="h-[50px] w-full md:w-[160px] rounded-xl newsletter-skeleton" aria-hidden="true" />
            ) : (
              <motion.button
                type="submit"
                className="bg-primary-fixed text-on-primary-fixed font-black text-base px-7 py-3 rounded-xl"
                {...hoverScale}
              >
                Join & Save 20%
              </motion.button>
            )}
          </motion.form>

          <AnimatePresence mode="wait">
            {status === 'success' && (
              <motion.div
                key="success"
                className="mt-4"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-sm">{message}</span>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                className="mt-4 bg-red-500/20 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 text-sm text-on-primary/60 font-medium">
            *Offer valid for first-time customers only.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
