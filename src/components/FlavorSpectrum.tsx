import { useState } from 'react';
import { ArrowRight, Instagram } from 'lucide-react';

const flavors = [
  {
    id: 'classic',
    name: 'The Classic',
    tagline: 'Clean, airy crunch',
    desc: 'Pure makhana, nothing added. The raw, honest taste of Bihar — light, wholesome, and endlessly snackable.',
    badge: 'Fan Favourite',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
  },
  {
    id: 'masala',
    name: 'Spicy Masala',
    tagline: 'Bold, fiery kick',
    desc: 'A fearless blend of chili, cumin, and coriander — full-flavored heat without anything artificial.',
    badge: 'Coming Soon',
    accentBg: 'bg-red-50',
    accentBorder: 'border-red-200',
    accentText: 'text-red-700',
    badgeBg: 'bg-red-100 text-red-800',
    image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
  },
  {
    id: 'pudina',
    name: 'Tangy Pudina',
    tagline: 'Fresh, zesty bite',
    desc: 'Cool mint meets a tangy tamarind finish — the kind of flavour that surprises you every single time.',
    badge: 'Coming Soon',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop&crop=center',
  },
];

export function FlavorSpectrum() {
  const [activeIndex, setActiveIndex] = useState(0);

  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    const normalizedOffset = ((offset % flavors.length) + flavors.length) % flavors.length;

    if (normalizedOffset === 0) {
      return {
        zIndex: 30,
        transform: 'translateX(0%) rotate(0deg) scale(1)',
        opacity: 1,
        filter: 'none',
      };
    } else if (normalizedOffset === 1) {
      return {
        zIndex: 20,
        transform: 'translateX(6%) rotate(3deg) scale(0.96)',
        opacity: 0.92,
        filter: 'brightness(0.96)',
      };
    } else {
      return {
        zIndex: 10,
        transform: 'translateX(11%) rotate(5.5deg) scale(0.92)',
        opacity: 0.84,
        filter: 'brightness(0.92)',
      };
    }
  };

  const advance = () => {
    setActiveIndex((prev) => (prev + 1) % flavors.length);
  };

  const activeFlavor = flavors[activeIndex];

  return (
    <section id="shop" className="py-20 md:py-28 px-6 md:px-8 bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="space-y-3 max-w-xl">
            <span className="section-label">Flavors</span>
            <h2
              style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-primary leading-tight"
            >
              Flavor Spectrum
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Real ingredients, real flavour, nothing extra. Every flavor tells a different story of the soil.
            </p>
          </div>
          <a
            href="https://www.instagram.com/makhanaexpress"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary/70 transition-colors shrink-0 group"
          >
            <Instagram className="w-4 h-4" />
            Follow for new drops
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            className="relative mx-auto w-full"
            style={{ maxWidth: '380px', height: '500px' }}
          >
            {[...flavors].map((flavor, index) => {
              const style = getCardStyle(index);
              const isActive = index === activeIndex;
              return (
                <div
                  key={flavor.id}
                  onClick={() => !isActive && setActiveIndex(index)}
                  className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out ${!isActive ? 'cursor-pointer' : ''}`}
                  style={{
                    zIndex: style.zIndex,
                    transform: style.transform,
                    opacity: style.opacity,
                    filter: style.filter,
                    willChange: 'transform',
                  }}
                >
                  <img
                    src={flavor.image}
                    alt={flavor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${flavor.badgeBg}`}>
                      {flavor.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-8">
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-1">{flavor.tagline}</p>
                    <h3 className="text-white font-black text-xl leading-tight">{flavor.name}</h3>
                    {isActive && (
                      <p className="text-white/70 text-sm leading-relaxed mt-2 line-clamp-2">{flavor.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-8">
            <div className={`rounded-2xl border p-6 transition-all duration-300 ${activeFlavor.accentBg} ${activeFlavor.accentBorder}`}>
              <div className="space-y-3">
                <p className={`text-[11px] font-bold uppercase tracking-widest ${activeFlavor.accentText}`}>
                  {activeFlavor.tagline}
                </p>
                <h3 className="font-headline font-black text-2xl text-on-surface leading-tight">
                  {activeFlavor.name}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {activeFlavor.desc}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                All Flavors
              </p>
              <div className="flex flex-col gap-2">
                {flavors.map((flavor, index) => (
                  <button
                    key={flavor.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                      index === activeIndex
                        ? `${flavor.accentBg} ${flavor.accentBorder} shadow-sm`
                        : 'bg-surface-container border-surface-container-high hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <img src={flavor.image} alt={flavor.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-none ${index === activeIndex ? activeFlavor.accentText : 'text-on-surface'}`}>
                        {flavor.name}
                      </p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">{flavor.tagline}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${flavor.badgeBg}`}>
                      {flavor.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={advance}
              className="btn-primary w-full justify-center hover:scale-[1.02] transition-transform duration-150"
            >
              Next Flavor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
