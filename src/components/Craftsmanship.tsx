import { Hand, ShieldCheck, Droplets } from 'lucide-react';

export function Craftsmanship() {
  return (
    <section id="heritage" className="py-16 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 relative">
          <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden aspect-video w-full">
            <img
              className="w-full h-full object-cover"
              src="/Screenshot_2026-04-09_at_7.00.41_PM.webp"
              alt="Lotus pond in Bihar where makhana is harvested by hand"
              loading="lazy"
              width={800}
              height={450}
            />
          </div>

          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#154212] text-white rounded-full flex flex-col items-center justify-center text-center p-4 z-20">
            <span className="text-3xl font-black">100%</span>
            <span className="text-xs font-bold uppercase leading-tight">
              Traceable <br /> Farm-to-Bag
            </span>
          </div>

          <div className="absolute -top-12 -left-12 opacity-10 text-[12rem] pointer-events-none select-none z-0" aria-hidden="true">
            🌿
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <h2 style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)' }} className="font-headline font-black text-primary leading-[1.1]">
            From Bihar's Pond
          </h2>

          <div className="space-y-3.5">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <Hand className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface mb-0.5">Harvested by Hand</h4>
                <p className="text-on-surface-variant text-sm leading-[1.5]">
                  Every seed is hand picked by farmers, a tradition passed down through
                  generations of farming families who have done this for over a thousand years.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface mb-0.5">Nothing Added. Ever.</h4>
                <p className="text-on-surface-variant text-sm leading-[1.5]">
                  No roasting, no oil, no preservatives. We deliver makhana exactly as nature
                  made it - so you control what goes in, every single time.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface mb-0.5">Grown in Clean Water</h4>
                <p className="text-on-surface-variant text-sm leading-[1.5]">
                  Makhana grows in freshwater lotus ponds, untouched by factory floors. No soil
                  pesticides, no industrial processing - just water, sun, and time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
