import { CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/analytics';

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
      <div className="max-w-[1200px] mx-auto bg-primary rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-text-overlay opacity-5 overflow-hidden flex items-center justify-center">
          <span className="text-[20vw] font-black text-white leading-none">EXPRESS</span>
        </div>

        <div className="relative z-10 px-8 py-10 text-center flex flex-col items-center">
          <h2 style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }} className="font-headline font-black text-on-primary mb-3 leading-[1.1]">
            From Pond To Pack,
            <br /> Done Right
          </h2>
          <p className="text-base md:text-lg text-on-primary/80 mb-6 max-w-2xl">
            Join our journey and get 20% off on your first order. Authentic makhana, crafted with
            care.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
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
                <input
                  id="newsletter-email"
                  className="appearance-none flex-grow bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-5 py-3 rounded-xl focus:ring-2 focus:ring-primary-fixed focus:border-transparent focus:outline-none text-base"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <button
                type="submit"
                className="bg-primary-fixed text-on-primary-fixed font-black text-base px-7 py-3 rounded-xl hover:scale-105 transition-transform"
              >
                Join & Save 20%
              </button>
            )}
          </form>

          {status === 'success' && (
            <div className="mt-4 animate-fade-in">
              <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-sm">{message}</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 bg-red-500/20 backdrop-blur-sm text-white px-5 py-3 rounded-full flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">{message}</span>
            </div>
          )}

          <p className="mt-4 text-sm text-on-primary/60 font-medium">
            *Offer valid for first-time customers only.
          </p>
        </div>
      </div>
    </section>
  );
}
