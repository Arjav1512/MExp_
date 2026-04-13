import { ArrowRight } from 'lucide-react';

export function FlavorSpectrum() {
  return (
    <section id="shop" className="py-16 px-8 bg-surface-container-low relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-5">
          <div className="max-w-2xl">
            <h2 style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)' }} className="font-headline font-black tracking-tight text-primary mb-3 leading-tight">
              Flavor Spectrum
            </h2>
            <p className="text-base text-on-surface-variant font-medium leading-[1.5]">
              Real ingredients, real flavour, nothing extra. Every flavor tells a different story
              of the soil.
            </p>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 group underline-offset-4 hover:underline text-sm">
            EXPLORE ALL FLAVORS (Coming Soon)
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: '420px' }}>
          {/* Image collage background with blur applied */}
          <div
            className="absolute inset-0 grid grid-cols-2 grid-rows-2"
            style={{
              filter: 'blur(18px)',
              transform: 'scale(1.1)', // Scale up slightly to hide blur edges
            }}
          >
            <div
              className="bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80&fit=crop)' }}
            />
            <div
              className="bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80&fit=crop)' }}
            />
            <div
              className="bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1596040033229-a0b55ee4a3cb?w=800&q=80&fit=crop)' }}
            />
            <div
              className="bg-cover bg-center"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506802913710-40e2e66339c9?w=800&q=80&fit=crop)' }}
            />
          </div>

          {/* Dark overlay on top */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(21, 66, 18, 0.5)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-20 h-full min-h-[420px]">
            {/* Top badge */}
            <span className="inline-block bg-[#bcf0ae] text-[#002201] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
              Something exciting is cooking
            </span>

            {/* Main headline */}
            <h3 className="font-headline font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              We're crafting something<br />you'll crave.
            </h3>

            {/* Subtext */}
            <p className="text-white/70 max-w-md text-lg leading-relaxed mb-10">
              New flavours are being perfected in our kitchen — bold, clean, and made without compromise. Be the first to know when they drop.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a
                href="https://www.instagram.com/makhanaexpress"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-[#154212] font-bold rounded-xl hover:scale-105 transition-transform text-sm uppercase tracking-wide inline-block"
              >
                Follow for Updates
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
