import { ShoppingBag, Package, ArrowRight } from 'lucide-react';

interface ProductShowcaseProps {
  onShopCTA: () => void;
}

const shots = [
  {
    src: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
    alt: 'Close-up of crispy white makhana foxnuts in a dark ceramic bowl — visible porous texture',
    label: 'Light. Crunchy. Addictive.',
    sublabel: 'Feel it before the first bite',
  },
  {
    src: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
    alt: 'Whole makhana foxnuts scattered — showing clean white colour and porous texture',
    label: 'Guilt-free snacking.',
    sublabel: '0 additives. Just makhana.',
  },
  {
    src: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
    alt: 'Bowl of makhana served as a snack at a tea-time moment — perfect ready-to-eat size',
    label: 'Perfect snack moment.',
    sublabel: 'Ready in seconds. No prep.',
  },
];

const attributes = [
  { label: 'Light & airy', icon: '○' },
  { label: 'Gluten-free', icon: '✓' },
  { label: 'High protein', icon: '↑' },
  { label: 'Low calorie', icon: '↓' },
  { label: 'Vegan', icon: '✓' },
  { label: '0 additives', icon: '✓' },
];

export function ProductShowcase({ onShopCTA }: ProductShowcaseProps) {
  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-surface-container-lowest border-y border-surface-container-high">
      <div className="max-w-[1200px] mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
          <div className="space-y-3">
            <span className="section-label">The Product</span>
            <h2
              style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-primary leading-tight"
            >
              See What You're Getting
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-md">
              Pure, whole makhana — clean, light, and satisfying. You can see the texture.
              That's how you know it's real.
            </p>
          </div>
          <button
            onClick={onShopCTA}
            className="btn-primary shrink-0 hover:scale-[1.02] transition-transform duration-150"
            style={{ boxShadow: '0 4px 20px rgba(21,66,18,0.28)' }}
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Fresh Makhana
          </button>
        </div>

        {/* Photo grid — craving triggers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shots.map(({ src, alt, label, sublabel }) => (
            <div
              key={label}
              className="group relative rounded-2xl overflow-hidden bg-stone-100"
              style={{ aspectRatio: '4/5', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                width={480}
                height={600}
              />
              {/* Bottom gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              {/* Top-right craving chip */}
              <div className="absolute top-3.5 right-3.5">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Fresh batch
                </span>
              </div>
              {/* Bottom copy */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-black text-[15px] leading-tight">{label}</p>
                <p className="text-white/60 text-[11px] font-medium mt-0.5">{sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Packaging + delivery strip */}
        <div className="bg-surface-container rounded-2xl border border-surface-container-high overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left — packaging info */}
            <div className="flex flex-col justify-center gap-4 px-8 py-8 border-b md:border-b-0 md:border-r border-surface-container-high">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline font-black text-[17px] text-on-surface leading-tight">
                  Delivered fresh in sealed packs
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Every bag is sealed at source — no exposure, no contamination, no compromise
                  on freshness from Bihar to your door.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Food-grade seal', 'Moisture-lock pack', 'Tamper evident'].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-fixed/50 px-2.5 py-1 rounded-full border border-primary-fixed uppercase tracking-wide"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — product attributes */}
            <div className="px-8 py-8">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-5">
                What's inside every pack
              </p>
              <div className="grid grid-cols-2 gap-3">
                {attributes.map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/[0.08] flex items-center justify-center text-primary text-[11px] font-black shrink-0">
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-on-surface">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inline secondary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-on-surface-variant text-sm font-medium text-center sm:text-left">
            Fresh batches made weekly — don't miss yours.
          </p>
          <button
            onClick={onShopCTA}
            className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary pb-0.5 hover:gap-3 transition-all duration-200 group shrink-0"
          >
            Get Your First Pack
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
