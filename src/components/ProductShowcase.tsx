import { ShoppingBag } from 'lucide-react';

interface ProductShowcaseProps {
  onShopCTA: () => void;
}

const shots = [
  {
    src: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Close-up of crispy makhana foxnuts in a ceramic bowl',
    label: 'Crispy texture',
  },
  {
    src: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Makhana served as a snack in a bowl',
    label: 'Perfect snack size',
  },
  {
    src: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Natural whole makhana foxnuts close-up showing texture',
    label: 'Nothing added',
  },
];

export function ProductShowcase({ onShopCTA }: ProductShowcaseProps) {
  return (
    <section className="py-16 px-6 md:px-8 bg-surface-container-lowest border-y border-surface-container-high">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div className="space-y-2">
            <span className="section-label">The Product</span>
            <h2
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-primary leading-tight"
            >
              See What You're Getting
            </h2>
            <p className="text-on-surface-variant text-sm max-w-md">
              Pure, whole makhana — clean, light, and satisfying. Exactly what you'd expect from a snack with nothing to hide.
            </p>
          </div>
          <button
            onClick={onShopCTA}
            className="btn-primary shrink-0"
            style={{ boxShadow: '0 4px 20px rgba(21,66,18,0.28)' }}
          >
            <ShoppingBag className="w-4 h-4" />
            Order Your Pack
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shots.map(({ src, alt, label }) => (
            <div
              key={label}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-surface-container"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                width={400}
                height={400}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
          {['Light & airy', 'Naturally gluten-free', 'High protein', 'Low calorie', 'Vegan friendly'].map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-primary bg-primary-fixed/50 px-3 py-1.5 rounded-full border border-primary-fixed"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
