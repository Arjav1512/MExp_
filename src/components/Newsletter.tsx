import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';
import { fadeUp, staggerContainer, viewportOptions } from '../lib/motion';

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
      setMessage("You're on the list! We'll send your 20% off code when we launch.");
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
        setMessage("You're on the list! We'll send your 20% off code when we launch.");
        setEmail('');

        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 6000);
      }
    } catch (error) {
      trackEvent('newsletter_error');
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <section id="newsletter" className="py-8 px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="relative bg-primary rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOptions}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
            <span className="text-[18vw] font-black text-white/[0.04] leading-none tracking-tighter">
              EXPRESS
            </span>
          </div>

          <motion.div
            className="relative z-10 px-8 md:px-16 py-14 text-center flex flex-col items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <motion.span
              className="inline-block bg-primary-fixed/20 border border-primary-fixed/40 text-primary-fixed text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
              variants={fadeUp}
            >
              Join the Community
            </motion.span>

            <motion.h2
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-on-primary mb-3 leading-tight"
              variants={fadeUp}
            >
              From Pond To Pack,<br />Done Right
            </motion.h2>
            <motion.p
              className="text-on-primary/70 text-base mb-8 max-w-lg leading-relaxed"
              variants={fadeUp}
            >
              Join our journey and get 20% off on your first order. Authentic makhana, crafted with care.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
              variants={fadeUp}
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
                <>
                  <div className="flex-grow h-[50px] rounded-xl newsletter-skeleton" aria-hidden="true" />
                  <div className="h-[50px] w-full sm:w-[160px] rounded-xl newsletter-skeleton" aria-hidden="true" />
                </>
              ) : (
                <>
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    className="flex-grow bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 px-5 py-3 rounded-xl focus:ring-2 focus:ring-primary-fixed focus:border-transparent focus:outline-none text-[15px] transition-all"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'success'}
                  />
                  <motion.button
                    type="submit"
                    disabled={status === 'success'}
                    className="inline-flex items-center justify-center gap-2 bg-primary-fixed text-on-primary-fixed font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-60 whitespace-nowrap"
                    whileHover={{ scale: 1.04, filter: 'brightness(1.06)' }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Send className="w-4 h-4" />
                    Join & Save 20%
                  </motion.button>
                </>
              )}
            </motion.form>

            <AnimatePresence>
              {status === 'success' && (
                <motion.div
                  className="mt-5"
                  key="success"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-sm text-white px-5 py-3 rounded-full border border-white/20">
                    <CheckCircle className="w-5 h-5 shrink-0 text-primary-fixed" />
                    <span className="font-semibold text-sm">{message}</span>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  className="mt-5"
                  key="error"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                >
                  <div className="inline-flex items-center gap-2.5 bg-red-500/15 text-white px-5 py-3 rounded-full border border-red-400/30">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-semibold text-sm">{message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-4 text-xs text-on-primary/45 font-medium">
              We respect your privacy. No spam. Unsubscribe anytime.
            </p>
            <p className="mt-1.5 text-xs text-on-primary/35 font-medium">
              *Offer valid for first-time customers only.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
