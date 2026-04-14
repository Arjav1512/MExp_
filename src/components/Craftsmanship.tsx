import { Hand, ShieldCheck, Droplets } from 'lucide-react';

const pillars = [
  {
    icon: Hand,
    title: 'Harvested by Hand',
    desc: 'Every seed is hand picked by farmers — a tradition passed down through generations who have done this for over a thousand years.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing Added. Ever.',
    desc: 'No roasting, no oil, no preservatives. We deliver makhana exactly as nature made it, so you control what goes in.',
  },
  {
    icon: Droplets,
    title: 'Grown in Clean Water',
    desc: 'Makhana grows in freshwater lotus ponds, untouched by factory floors. No pesticides — just water, sun, and time.',
  },
];

export function Craftsmanship() {
  return (
    <section id="heritage" className="py-20 md:py-28 px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden aspect-video w-full shadow-2xl">
              <img
                className="w-full h-full object-cover"
                src="/Screenshot_2026-04-09_at_7.00.41_PM.webp"
                alt="Lotus pond in Bihar where makhana is harvested by hand"
                loading="lazy"
                width={800}
                height={450}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20" />
            </div>

            <div className="absolute -bottom-6 -right-4 md:-bottom-8 md:-right-8 w-40 h-40 md:w-48 md:h-48 bg-primary text-on-primary rounded-full flex flex-col items-center justify-center text-center p-4 z-20 shadow-xl shadow-primary/30">
              <span className="text-3xl font-black leading-none">100%</span>
              <span className="text-[10px] font-bold uppercase leading-tight tracking-wider mt-1 text-on-primary/80">
                Traceable<br />Farm-to-Bag
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="section-label">Heritage</span>
              <h2
                style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
                className="font-headline font-black text-primary leading-[1.05]"
              >
                From Bihar's Pond
              </h2>
              <div className="divider" />
            </div>

            <div className="space-y-4">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-on-surface mb-1">{title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
