import { ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, staggerContainerFast, viewportOptions } from '../lib/motion';

interface ProductShowcaseProps {
  onShopCTA: () => void;
}

const shots = [
  {
    src: '/1st.png',
    alt: 'Clean white makhana foxnuts in a wooden bowl on a linen cloth — pure and unprocessed',
    label: 'Light. Crunchy. Addictive.',
    sublabel: 'Feel it before the first bite',
    objectPosition: 'center center',
  },
  {
    src: '/2nd.jpeg',
    alt: 'Hand dropping makhana foxnuts into a bowl — action shot showing the snacking moment',
    label: 'Guilt-free snacking.',
    sublabel: '0 additives. Just makhana.',
    objectPosition: 'center 22%',
  },
  {
    src: '/3rd.png',
    alt: 'Open Makhana Express packaging box with bowl of makhana — showing the product you receive',
    label: 'Perfect snack moment.',
    sublabel: 'Ready in seconds. No prep.',
    objectPosition: '40% center',
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

        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <motion.div className="space-y-3" variants={fadeLeft}>
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
          </motion.div>
          <motion.button
            onClick={onShopCTA}
            className="btn-primary shrink-0"
            style={{ boxShadow: '0 4px 20px rgba(21,66,18,0.28)' }}
            variants={fadeRight}
            whileHover={{ scale: 1.04, filter: 'brightness(1.08)' }}
            whileTap={{ scale: 0.96 }}
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Fresh Makhana
          </motion.button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          {shots.map(({ src, alt, label, sublabel, objectPosition }, i) => (
            <motion.div
              key={label}
              className="group relative rounded-2xl overflow-hidden bg-stone-100"
              style={{ aspectRatio: '4/5', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.16)' }}
              transition={{ delay: i * 0.05 }}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ objectPosition }}
                loading="lazy"
                width={480}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute top-3.5 right-3.5">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Fresh batch
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-black text-[15px] leading-tight">{label}</p>
                <p className="text-white/60 text-[11px] font-medium mt-0.5">{sublabel}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-surface-container rounded-2xl border border-surface-container-high overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
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
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <p className="text-on-surface-variant text-sm font-medium text-center sm:text-left">
            Fresh batches made weekly — don't miss yours.
          </p>
          <motion.button
            onClick={onShopCTA}
            className="inline-flex items-center gap-2 text-primary font-bold text-sm border-b-2 border-primary pb-0.5 shrink-0 group"
            whileHover={{ gap: '12px' }}
          >
            Get Your First Pack
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
