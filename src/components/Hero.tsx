import { Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SkeletonHeroCard } from './Skeleton';
import type { Page } from '../lib/router';
import { trackCTAClick } from '../lib/analytics';

interface HeroProps {
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

export function Hero({ navigate, onShopCTA }: HeroProps) {
  const [cardActive, setCardActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isMobile || !cardActive) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (stackRef.current && !stackRef.current.contains(e.target as Node)) {
        setCardActive(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [cardActive, isMobile]);

  return (
    <section id="home" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden px-8">
      <div className="absolute inset-0 bg-text-overlay flex items-center justify-center overflow-hidden">
        <span className="text-[25vw] font-black text-on-surface opacity-[0.03] leading-none select-none">
          MAKHANA
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10 pt-20">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-bold text-sm">
            <Zap className="w-4 h-4" />
            SNACK BETTER. LIVE BETTER.
          </div>

          <h1 style={{ fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)' }} className="font-headline font-black tracking-tighter leading-[0.9] text-primary">
            SNACK <br /> FREELY.
          </h1>

          <p style={{ fontSize: 'clamp(1.0625rem, 1.4vw, 1.25rem)' }} className="text-on-surface-variant max-w-md font-medium leading-[1.5]">
            Natural makhana with no added preservatives.
            <br />
            No Junk. Just Good.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => { trackCTAClick('Shop', 'coming-soon-modal'); onShopCTA(); }}
              className="bg-primary hover:bg-primary-container text-on-primary text-base font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-xl shadow-primary/20"
            >
              Shop
            </button>
            <button
              onClick={() => navigate('mission')}
              className="border-2 border-outline text-on-surface text-base font-bold px-8 py-3.5 rounded-xl hover:bg-surface-container transition-all"
            >
              Our Mission
            </button>
          </div>
        </div>

        <div
          ref={stackRef}
          className="relative h-[500px] md:h-[600px] flex justify-center items-center cursor-pointer"
          onMouseEnter={() => !isMobile && setCardActive(true)}
          onMouseLeave={() => !isMobile && setCardActive(false)}
          onClick={() => isMobile && setCardActive(prev => !prev)}
        >
          {/* Card 1 - Green (Peri Peri) */}
          <div
            className="absolute w-72 h-96 bg-[#2d5a27] rounded-2xl z-0 overflow-hidden flex flex-col justify-between p-6"
            style={{
              transform: cardActive
                ? 'rotate(-28deg) translateX(-90px) translateY(-20px)'
                : 'rotate(-12deg) translateX(-48px)',
              boxShadow: cardActive
                ? '0 32px 64px rgba(0,0,0,0.25)'
                : '0 20px 40px rgba(0,0,0,0.15)',
              transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease',
              willChange: 'transform',
            }}
          >
            <div
              style={{
                opacity: cardActive ? 1 : 0,
                transition: 'opacity 0.2s ease',
                transitionDelay: cardActive ? '0.25s' : '0s',
              }}
              className="flex flex-col h-full justify-between"
            >
              {/* Top decorative */}
              <div className="flex justify-end">
                <span className="text-3xl opacity-40">🌶</span>
              </div>
              {/* Bottom content */}
              <div>
                <span className="inline-block bg-[#bcf0ae] text-[#002201] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Coming Soon
                </span>
                <h3 className="font-headline font-black text-2xl text-white">
                  Peri Peri
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Bold. Spiced. Unapologetic.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 - Terracotta (Black Pepper) */}
          <div
            className="absolute w-72 h-96 bg-[#7f3f00] rounded-2xl z-10 overflow-hidden flex flex-col justify-between p-6"
            style={{
              transform: cardActive
                ? 'rotate(22deg) translateX(90px) translateY(-20px)'
                : 'rotate(6deg) translateX(32px)',
              boxShadow: cardActive
                ? '0 32px 64px rgba(0,0,0,0.25)'
                : '0 20px 40px rgba(0,0,0,0.15)',
              transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease',
              willChange: 'transform',
            }}
          >
            <div
              style={{
                opacity: cardActive ? 1 : 0,
                transition: 'opacity 0.2s ease',
                transitionDelay: cardActive ? '0.25s' : '0s',
              }}
              className="flex flex-col h-full justify-between"
            >
              {/* Top decorative */}
              <div className="flex justify-end">
                <span className="text-3xl opacity-40">✦</span>
              </div>
              {/* Bottom content */}
              <div>
                <span className="inline-block bg-[#ffb27a] text-[#301400] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Coming Soon
                </span>
                <h3 className="font-headline font-black text-2xl text-white">
                  Black Pepper
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Sharp. Clean. Unexpected.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 - Front white (The Classic) */}
          {!imageLoaded && <SkeletonHeroCard />}
          <div
            className="absolute w-72 h-96 bg-white rounded-2xl z-20 flex flex-col p-6"
            style={{
              transform: cardActive
                ? 'rotate(0deg) translateY(0px) scale(1.04)'
                : 'rotate(-2deg) translateY(16px)',
              boxShadow: cardActive
                ? '0 40px 80px rgba(0,0,0,0.20)'
                : '0 20px 40px rgba(0,0,0,0.12)',
              transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.45s ease',
              willChange: 'transform',
              opacity: imageLoaded ? 1 : 0,
            }}
          >
            <div className="flex-grow bg-surface-container rounded-md overflow-hidden mb-3">
              <img
                className="w-full h-full object-cover"
                src="/generated-1775776648075-7gnqn.webp"
                alt="White roasted foxnuts in bowl"
                width={288}
                height={360}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-headline font-bold text-primary text-sm">The Classic</h3>
              <p className="text-xs text-on-surface-variant">The purest way to eat makhana.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
