import { Hand, ShieldCheck, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeLeft, fadeRight, staggerContainer, fadeUp, viewportOnce } from '../lib/motion';

const features = [
  {
    icon: Hand,
    title: 'Harvested by Hand',
    body: 'Every seed is hand picked by farmers, a tradition passed down through generations of farming families who have done this for over a thousand years.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing Added. Ever.',
    body: 'No roasting, no oil, no preservatives. We deliver makhana exactly as nature made it - so you control what goes in, every single time.',
  },
  {
    icon: Droplets,
    title: 'Grown in Clean Water',
    body: 'Makhana grows in freshwater lotus ponds, untouched by factory floors. No soil pesticides, no industrial processing - just water, sun, and time.',
  },
];

export function Craftsmanship() {
  return (
    <section id="heritage" className="py-16 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <motion.div
          className="lg:col-span-7 relative"
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
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

          <motion.div
            className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#154212] text-white rounded-full flex flex-col items-center justify-center text-center p-4 z-20"
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
          >
            <span className="text-3xl font-black">100%</span>
            <span className="text-xs font-bold uppercase leading-tight">
              Traceable <br /> Farm-to-Bag
            </span>
          </motion.div>

          <div className="absolute -top-12 -left-12 opacity-10 text-[12rem] pointer-events-none select-none z-0" aria-hidden="true">
            🌿
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 space-y-5"
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <h2 style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)' }} className="font-headline font-black text-primary leading-[1.1]">
            From Bihar's Pond
          </h2>

          <motion.div
            className="space-y-3.5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {features.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                className="flex gap-3"
                variants={fadeUp}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0"
                  whileHover={{ scale: 1.12, backgroundColor: '#154212' }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-base text-on-surface mb-0.5">{title}</h4>
                  <p className="text-on-surface-variant text-sm leading-[1.5]">{body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
