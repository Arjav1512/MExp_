import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';

interface HeaderProps {
  page: Page;
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

export function Header({ page, navigate, onShopCTA }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="fixed top-0 w-full z-50 bg-stone-50/70 backdrop-blur-xl">
      <div className="flex justify-between items-center px-8 py-4 max-w-[1200px] mx-auto">
        <button
          className="text-xl font-black text-green-900 tracking-tighter hover:opacity-80 transition-opacity"
          onClick={() => { setIsMenuOpen(false); navigate('home'); }}
        >
          Makhana Express
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            className={`font-headline tracking-tight font-bold text-sm transition-all duration-300 hover:scale-105 ${
              page === 'home'
                ? 'text-green-900 border-b-2 border-green-800 pb-1'
                : 'text-stone-600 hover:text-green-800'
            }`}
            onClick={() => navigate('home')}
          >
            HOME
          </button>
          <button
            className="font-headline tracking-tight font-bold text-sm text-stone-600 hover:text-green-800 transition-all duration-300 hover:scale-105"
            onClick={() => handleNav('heritage')}
          >
            HERITAGE
          </button>
          <button
            className="font-headline tracking-tight font-bold text-sm text-stone-600 hover:text-green-800 transition-all duration-300 hover:scale-105"
            onClick={() => handleNav('community')}
          >
            COMMUNITY
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            className="transition-all duration-300 hover:scale-105 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm"
            onClick={() => { trackCTAClick('Order Now', 'coming-soon-modal'); setIsMenuOpen(false); onShopCTA(); }}
          >
            Order Now
          </button>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen
              ? <X className="w-6 h-6 text-primary" />
              : <Menu className="w-6 h-6 text-primary" />
            }
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-stone-50/95 backdrop-blur-xl px-8 py-4 border-t border-stone-200/50">
          <div className="flex flex-col gap-4">
            <button
              className="font-headline tracking-tight font-bold text-sm text-green-900 text-left"
              onClick={() => { setIsMenuOpen(false); navigate('home'); }}
            >
              HOME
            </button>
            <button
              className="font-headline tracking-tight font-bold text-sm text-stone-600 text-left"
              onClick={() => handleNav('heritage')}
            >
              HERITAGE
            </button>
            <button
              className="font-headline tracking-tight font-bold text-sm text-stone-600 text-left"
              onClick={() => handleNav('community')}
            >
              COMMUNITY
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
