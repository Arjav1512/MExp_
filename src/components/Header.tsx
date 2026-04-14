import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';
import { mobileMenuVariant, hoverScale } from '../lib/motion';

interface HeaderProps {
  page: Page;
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

export function Header({ page, navigate, onShopCTA }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const handleNav = (target: string) => {
    setIsMenuOpen(false);
    if (target === 'mission') {
      navigate('mission');
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
        >
          Makhana Express
        </motion.button>

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
          >
            Order Now
          </motion.button>
          <motion.button
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
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
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
  );
}
