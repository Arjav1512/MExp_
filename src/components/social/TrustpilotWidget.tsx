import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { trustpilotConfig } from '../../lib/integrations';
import { fadeUp, viewportOptions } from '../../lib/motion';
import { SectionHeading } from './SectionHeading';

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, forceReload?: boolean) => void };
  }
}

const TP_SCRIPT = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

// Loads the official Trustpilot bootstrap script exactly once, shared across mounts.
let scriptState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
const waiters: Array<(ok: boolean) => void> = [];

function loadTrustpilotScript(): Promise<boolean> {
  if (scriptState === 'ready') return Promise.resolve(true);
  if (scriptState === 'error') return Promise.resolve(false);
  return new Promise((resolve) => {
    waiters.push(resolve);
    if (scriptState === 'loading') return;
    scriptState = 'loading';
    const s = document.createElement('script');
    s.src = TP_SCRIPT;
    s.async = true;
    s.onload = () => {
      scriptState = 'ready';
      waiters.splice(0).forEach((w) => w(true));
    };
    s.onerror = () => {
      scriptState = 'error';
      waiters.splice(0).forEach((w) => w(false));
    };
    document.head.appendChild(s);
  });
}

export function TrustpilotWidget() {
  const cfg = trustpilotConfig();
  const boxRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (cfg.status !== 'live') return;
    let cancelled = false;
    loadTrustpilotScript().then((ok) => {
      if (cancelled) return;
      if (ok && boxRef.current && window.Trustpilot) {
        window.Trustpilot.loadFromElement(boxRef.current, true);
        setState('ready');
      } else {
        setState('error');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cfg.status]);

  return (
    <section className="py-16 md:py-20 px-6 md:px-8 bg-surface-container-low">
      <div className="max-w-[1100px] mx-auto">
        <SectionHeading
          label="Independent Reviews"
          title="Rated by real customers"
          description="Verified, independent feedback collected on Trustpilot — never edited, never bought."
        />

        <motion.div
          className="card-base p-6 md:p-8 min-h-[180px] flex items-center justify-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          {cfg.status === 'live' ? (
            <div className="w-full">
              {/* Official Trustpilot TrustBox — populated by the bootstrap script */}
              <div
                ref={boxRef}
                className="trustpilot-widget"
                data-locale="en-US"
                data-template-id={cfg.templateId}
                data-businessunit-id={cfg.businessUnitId}
                data-style-height="140px"
                data-style-width="100%"
                data-theme="light"
              >
                <a href={cfg.reviewUrl} target="_blank" rel="noopener noreferrer">Trustpilot</a>
              </div>
              {state === 'error' && <TrustpilotFallback reviewUrl={cfg.reviewUrl} configured />}
            </div>
          ) : (
            <TrustpilotFallback reviewUrl={cfg.reviewUrl} configured={false} />
          )}
        </motion.div>
      </div>
    </section>
  );
}

function TrustpilotFallback({ reviewUrl, configured }: { reviewUrl: string; configured: boolean }) {
  return (
    <div className="text-center max-w-md mx-auto py-2">
      <div className="w-12 h-12 rounded-full bg-primary-fixed/50 flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-6 h-6 text-primary" />
      </div>
      <div className="flex items-center justify-center gap-1 mb-3" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="w-5 h-5 fill-[#00b67a] text-[#00b67a]" />
        ))}
      </div>
      <p className="text-on-surface font-bold mb-1">
        {configured
          ? 'Our Trustpilot reviews are taking a moment to load.'
          : 'Help us build our Trustpilot reputation.'}
      </p>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
        {configured
          ? 'You can read and leave verified reviews directly on our Trustpilot profile.'
          : 'We collect independent, verified reviews on Trustpilot. Be one of the first to share your experience.'}
      </p>
      <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
        Review us on Trustpilot
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
