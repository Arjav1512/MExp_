<<<<<<< HEAD
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';
import { mobileMenuVariant, hoverScale } from '../lib/motion';
=======
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';
import { useCart } from '../lib/cart';
>>>>>>> origin/main

interface HeaderProps {
  page: Page;
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

export function Header({ page, navigate, onShopCTA }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
<<<<<<< HEAD
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);
=======
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
>>>>>>> origin/main

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
<<<<<<< HEAD
    <motion.nav
      className="fixed top-0 w-full z-50"
      animate={{
        backgroundColor: scrolled ? 'rgba(250, 249, 245, 0.92)' : 'rgba(250, 249, 245, 0)',
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.07)' : '0 0 0 rgba(0,0,0,0)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto">
        <motion.button
          className="text-xl font-black text-green-900 tracking-tighter"
          onClick={() => { setIsMenuOpen(false); navigate('home'); }}
          whileHover={{ opacity: 0.75 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
=======
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
>>>>>>> origin/main
        >
          Makhana Express
        </motion.button>

<<<<<<< HEAD
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'HOME', action: () => navigate('home'), active: page === 'home' },
            { label: 'HERITAGE', action: () => handleNav('heritage'), active: false },
            { label: 'COMMUNITY', action: () => handleNav('community'), active: false },
          ].map(({ label, action, active }) => (
            <motion.button
              key={label}
              className={`font-headline tracking-tight font-bold text-sm relative ${
                active ? 'text-green-900' : 'text-stone-600 hover:text-green-800'
              }`}
              onClick={action}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-800 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm"
            onClick={() => {
              trackCTAClick('Order Now', 'coming-soon-modal');
              setIsMenuOpen(false);
              onShopCTA();
            }}
            {...hoverScale}
=======
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          <NavButton label="Home" active={page === 'home'} onClick={() => { navigate('home'); window.scrollTo({ top: 0 }); }} />
          <NavButton label="Heritage" active={false} onClick={() => handleNav('heritage')} />
          <NavButton label="Community" active={false} onClick={() => handleNav('community')} />
          <NavButton label="Our Mission" active={page === 'mission'} onClick={() => handleNav('mission')} />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            className="relative w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
            onClick={openCart}
            aria-label={`Open cart${count > 0 ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-black flex items-center justify-center tabular-nums"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            className="btn-primary hidden md:inline-flex"
            onClick={() => { trackCTAClick('Order Now', 'product-page'); setIsMenuOpen(false); onShopCTA(); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
>>>>>>> origin/main
          >
            Order Now
          </motion.button>
          <motion.button
<<<<<<< HEAD
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X className="w-6 h-6 text-primary" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu className="w-6 h-6 text-primary" />
=======
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
>>>>>>> origin/main
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
<<<<<<< HEAD
            className="md:hidden bg-stone-50/98 backdrop-blur-xl px-8 py-5 border-t border-stone-200/50 overflow-hidden"
            variants={mobileMenuVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col gap-5">
              {[
                { label: 'HOME', action: () => { setIsMenuOpen(false); navigate('home'); } },
                { label: 'HERITAGE', action: () => handleNav('heritage') },
                { label: 'COMMUNITY', action: () => handleNav('community') },
              ].map(({ label, action }, i) => (
                <motion.button
                  key={label}
                  className="font-headline tracking-tight font-bold text-sm text-stone-700 text-left"
                  onClick={action}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
=======
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
                  onClick={() => { trackCTAClick('Order Now', 'product-page'); setIsMenuOpen(false); onShopCTA(); }}
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
>>>>>>> origin/main
  );
}
