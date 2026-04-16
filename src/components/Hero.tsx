import { Zap, ArrowRight } from 'lucide-react';
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
    <section id="home" className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden px-6 md:px-8">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <span className="text-[28vw] font-black text-on-surface opacity-[0.025] leading-none tracking-tighter">
          MAKHANA
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 pt-[68px]">
        <div className="space-y-5 lg:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/60 text-primary font-bold text-xs uppercase tracking-widest border border-primary-fixed">
            <Zap className="w-3.5 h-3.5" />
            Snack Better. Live Better.
          </div>

          <div className="space-y-2">
            <h1
              style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', lineHeight: '0.88', letterSpacing: '-0.03em' }}
              className="font-headline font-black text-primary"
            >
              SNACK<br />FREELY.
            </h1>
            <p
              style={{ fontSize: 'clamp(1rem, 1.35vw, 1.15rem)' }}
              className="text-on-surface font-semibold leading-snug max-w-[380px] pt-2"
            >
              Clean, crunchy makhana you'll keep reaching for.
            </p>
            <p
              style={{ fontSize: 'clamp(0.875rem, 1.1vw, 1rem)' }}
              className="text-on-surface-variant font-medium leading-relaxed max-w-[380px]"
            >
              No junk. No preservatives. Just good.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { trackCTAClick('Shop', 'coming-soon-modal'); onShopCTA(); }}
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-black text-base px-10 py-4 rounded-xl transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]"
                style={{ boxShadow: '0 4px 24px rgba(21,66,18,0.35), 0 1px 4px rgba(21,66,18,0.2)' }}
              >
                Shop Fresh Makhana
              </button>
            </div>
            <button
              onClick={() => navigate('mission')}
              className="btn-secondary text-base px-8 py-4 inline-flex items-center gap-2 group self-start"
            >
              Our Mission
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {[
              { value: '100%', label: 'Natural' },
              { value: '0', label: 'Preservatives' },
              { value: '1000+', label: 'Yrs Tradition' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-headline font-black text-primary text-xl leading-none">{stat.value}</p>
                <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wide mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={stackRef}
          className="relative h-[480px] md:h-[560px] flex justify-center items-center cursor-pointer"
          onMouseEnter={() => !isMobile && setCardActive(true)}
          onMouseLeave={() => !isMobile && setCardActive(false)}
          onClick={() => isMobile && setCardActive(prev => !prev)}
          aria-label="Interactive product card stack — hover to explore flavors"
        >
          {/* Card 1 – Green (Peri Peri) */}
          <div
            className="absolute w-[280px] h-[360px] bg-[#1e4a1a] rounded-2xl z-0 overflow-hidden flex flex-col justify-between p-6"
            style={{
              transform: cardActive
                ? 'rotate(-26deg) translateX(-88px) translateY(-16px)'
                : 'rotate(-12deg) translateX(-44px)',
              boxShadow: cardActive ? '0 28px 56px rgba(0,0,0,0.28)' : '0 16px 36px rgba(0,0,0,0.16)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
              willChange: 'transform',
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1 bg-white/10 text-white/75 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                  Crispy
                </span>
                <span className="text-xl opacity-40">🌶</span>
              </div>
              <div>
                <span className="inline-block bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Coming Soon
                </span>
                <h3 className="font-headline font-black text-[22px] text-white leading-tight">Peri Peri</h3>
                <p className="text-white/65 text-sm mt-1.5 font-medium">Lightly spiced, fiery finish.</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Airy</p>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Crunchy</p>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Addictive</p>
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-primary-fixed text-xs font-bold transition-all duration-200"
                  style={{ opacity: cardActive ? 1 : 0, transform: cardActive ? 'translateY(0)' : 'translateY(4px)', transitionDelay: cardActive ? '0.28s' : '0s' }}
                >
                  Explore Flavor <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 – Terracotta (Black Pepper) */}
          <div
            className="absolute w-[280px] h-[360px] bg-[#7f3f00] rounded-2xl z-10 overflow-hidden flex flex-col justify-between p-6"
            style={{
              transform: cardActive
                ? 'rotate(22deg) translateX(88px) translateY(-16px)'
                : 'rotate(6deg) translateX(30px)',
              boxShadow: cardActive ? '0 28px 56px rgba(0,0,0,0.28)' : '0 16px 36px rgba(0,0,0,0.16)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
              willChange: 'transform',
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1 bg-white/10 text-white/75 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                  Roasted
                </span>
                <span className="text-xl opacity-40">✦</span>
              </div>
              <div>
                <span className="inline-block bg-[#ffb27a] text-[#301400] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Coming Soon
                </span>
                <h3 className="font-headline font-black text-[22px] text-white leading-tight">Black Pepper</h3>
                <p className="text-white/65 text-sm mt-1.5 font-medium">Warm, earthy, satisfying crunch.</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Peppery</p>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Bold</p>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/30 inline-block" />
                  <p className="text-white/35 text-[11px]">Clean</p>
                </div>
                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-[#ffb27a] text-xs font-bold transition-all duration-200"
                  style={{ opacity: cardActive ? 1 : 0, transform: cardActive ? 'translateY(0)' : 'translateY(4px)', transitionDelay: cardActive ? '0.28s' : '0s' }}
                >
                  Explore Flavor <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 – Front white (The Classic) */}
          {!imageLoaded && <SkeletonHeroCard />}
          <div
            className="absolute w-[280px] h-[360px] bg-white rounded-2xl z-20 flex flex-col p-5"
            style={{
              transform: cardActive ? 'rotate(0deg) translateY(0) scale(1.05)' : 'rotate(-2deg) translateY(14px)',
              boxShadow: cardActive ? '0 40px 80px rgba(0,0,0,0.20)' : '0 20px 48px rgba(0,0,0,0.14)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
              willChange: 'transform',
              opacity: imageLoaded ? 1 : 0,
            }}
          >
            <div className="flex-grow bg-surface-container rounded-xl overflow-hidden mb-3">
              <img
                className="w-full h-full object-cover"
                src="/generated-1775776648075-7gnqn.webp"
                alt="White roasted foxnuts in bowl"
                width={280}
                height={360}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            <div className="px-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-black text-primary text-[15px] leading-none">The Classic</h3>
                <span className="text-[10px] bg-primary-fixed text-on-primary-fixed font-bold px-2 py-0.5 rounded-full">Airy</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Lightly roasted, earthy crunch.</p>
              <div className="flex items-center gap-1.5">
                <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant/30 inline-block" />
                <p className="text-[10px] text-on-surface-variant/50">Clean</p>
                <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant/30 inline-block" />
                <p className="text-[10px] text-on-surface-variant/50">Natural</p>
                <span className="w-0.5 h-0.5 rounded-full bg-on-surface-variant/30 inline-block" />
                <p className="text-[10px] text-on-surface-variant/50">0 Additives</p>
              </div>
            </div>
          </div>

          {!isMobile && (
            <p className="absolute -bottom-8 text-center text-xs text-on-surface-variant font-medium pointer-events-none">
              Hover to explore flavors
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
