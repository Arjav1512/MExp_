import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';

interface HeaderProps {
  page: Page;
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

export function Header({ page, navigate, onShopCTA }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (target: string) => {
    setIsMenuOpen(false);
    if (target === 'mission') {
      navigate('mission');
      window.scrollTo({ top: 0 });
      return;
    }
    if (page !== 'home') {
      navigate('home');
      setTimeout(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="fixed top-0 w-full z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(254,250,228,0.94)' : 'rgba(254,250,228,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(194,201,187,0.5)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 32px rgba(21,66,18,0.07)' : 'none',
      }}
    >
      <div className="flex justify-between items-center px-6 md:px-8 h-[68px] max-w-[1200px] mx-auto">
        <motion.button
          className="font-headline font-black text-lg text-primary tracking-tighter hover:opacity-70 transition-opacity"
          onClick={() => { setIsMenuOpen(false); navigate('home'); window.scrollTo({ top: 0 }); }}
          whileTap={{ scale: 0.96 }}
        >
          Makhana Express
        </motion.button>

        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          <NavButton label="Home" active={page === 'home'} onClick={() => { navigate('home'); window.scrollTo({ top: 0 }); }} />
          <NavButton label="Heritage" active={false} onClick={() => handleNav('heritage')} />
          <NavButton label="Community" active={false} onClick={() => handleNav('community')} />
          <NavButton label="Our Mission" active={page === 'mission'} onClick={() => handleNav('mission')} />
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            className="btn-primary hidden md:inline-flex"
            onClick={() => { trackCTAClick('Order Now', 'coming-soon-modal'); setIsMenuOpen(false); onShopCTA(); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Order Now
          </motion.button>
          <motion.button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-t border-surface-container-high px-6 py-5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
              {[
                { label: 'Home', action: () => { setIsMenuOpen(false); navigate('home'); window.scrollTo({ top: 0 }); } },
                { label: 'Heritage', action: () => handleNav('heritage') },
                { label: 'Community', action: () => handleNav('community') },
                { label: 'Our Mission', action: () => handleNav('mission') },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  className="text-left px-3 py-2.5 rounded-lg font-bold text-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
                  onClick={item.action}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.div
                className="mt-3 pt-3 border-t border-surface-container-high"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28, duration: 0.2 }}
              >
                <motion.button
                  className="btn-primary w-full"
                  onClick={() => { trackCTAClick('Order Now', 'coming-soon-modal'); setIsMenuOpen(false); onShopCTA(); }}
                  whileTap={{ scale: 0.97 }}
                >
                  Order Now
                </motion.button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className={`font-bold text-[11px] tracking-widest uppercase px-3.5 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'text-primary bg-primary/[0.08]'
          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
      }`}
      whileTap={{ scale: 0.94 }}
    >
      {label}
    </motion.button>
  );
}
