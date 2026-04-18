import { Hand, ShieldCheck, Droplets, Sparkles, Sun, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, fadeLeft, staggerContainer, staggerContainerFast, viewportOptions } from '../lib/motion';

const pillars = [
  {
    icon: Hand,
    title: 'Harvested by Hand',
    desc: 'Hand-picked by skilled farmers in Bihar — preserving texture and nutrition that machines can\'t.',
    benefit: 'Better quality, every time',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing Added. Ever.',
    desc: 'No oil, no preservatives, no fillers. You get raw makhana exactly as nature made it — cook it your way.',
    benefit: 'You control what you eat',
  },
  {
    icon: Droplets,
    title: 'Grown in Clean Water',
    desc: 'From freshwater lotus ponds, not factory floors. No soil pesticides — just pure water, sun, and time.',
    benefit: 'Cleaner than any farmed snack',
  },
];

const trustBadges = [
  { icon: Sun, label: 'Sun-Dried', proof: 'No artificial drying agents' },
  { icon: Sparkles, label: 'Washed & Cleaned', proof: 'Rinsed in clean water post-harvest' },
  { icon: CheckCircle, label: 'Quality Checked', proof: 'Sorted & inspected before packing' },
  { icon: ShieldCheck, label: 'Food Safe Processing', proof: 'Packed in food-grade facilities' },
];

export function Craftsmanship() {
  return (
    <section id="heritage" className="py-20 md:py-28 px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-7 relative pb-8 md:pb-10"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <div className="relative z-10 rounded-2xl overflow-hidden aspect-video w-full shadow-2xl">
              <img
                className="w-full h-full object-cover object-center"
                src="/Harvesting_makhana_in_a_lotus_pond.png"
                alt="Fresh makhana sourced from lotus ponds, cleaned and prepared for consumption"
                loading="lazy"
                width={800}
                height={450}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/20" />
              <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs font-semibold leading-snug">
                  Carefully cleaned and processed before reaching you
                </p>
              </div>
            </div>

            <motion.div
              className="absolute bottom-2 -right-2 md:-bottom-2 md:-right-6 w-36 h-36 md:w-44 md:h-44 bg-primary text-on-primary rounded-full flex flex-col items-center justify-center text-center p-4 z-20 shadow-xl shadow-primary/30"
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={viewportOptions}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span className="text-3xl font-black leading-none">100%</span>
              <span className="text-[10px] font-bold uppercase leading-tight tracking-wider mt-1 text-on-primary/80">
                Traceable<br />Farm-to-Bag
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <motion.div className="space-y-3" variants={fadeUp}>
              <span className="section-label">Heritage</span>
              <h2
                style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
                className="font-headline font-black text-primary leading-[1.05]"
              >
                Why Our Makhana is Different
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                From clean water ponds to your hands — every step is intentional, traceable, and honest.
              </p>
              <div className="divider" />
            </motion.div>

            <motion.div
              className="space-y-4"
              variants={staggerContainerFast}
            >
              {pillars.map(({ icon: Icon, title, desc, benefit }) => (
                <motion.div
                  key={title}
                  className="flex gap-4 group"
                  variants={fadeUp}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-on-surface mb-0.5">{title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                    <p className="text-primary text-xs font-bold mt-1">{benefit}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="pt-2 border-t border-surface-container-high space-y-4"
              variants={fadeUp}
            >
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Before it reaches you
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trustBadges.map(({ icon: Icon, label, proof }, i) => (
                  <motion.div
                    key={label}
                    className="flex items-start gap-2.5 bg-surface-container px-3 py-2.5 rounded-xl border border-surface-container-high"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportOptions}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface leading-none">{label}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">{proof}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
