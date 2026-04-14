import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, staggerContainer, hoverScale, viewportOnce } from '../lib/motion';

export function FlavorSpectrum() {
  return (
    <section id="shop" className="py-16 px-8 bg-surface-container-low relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-end mb-8 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div className="max-w-2xl" variants={fadeUp}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)' }} className="font-headline font-black tracking-tight text-primary mb-3 leading-tight">
              Flavor Spectrum
            </h2>
            <p className="text-base text-on-surface-variant font-medium leading-[1.5]">
              Real ingredients, real flavour, nothing extra. Every flavor tells a different story
              of the soil.
            </p>
          </motion.div>
          <motion.button
            className="text-primary font-bold flex items-center gap-2 group underline-offset-4 hover:underline text-sm"
            variants={fadeIn}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
          >
            EXPLORE ALL FLAVORS (Coming Soon)
            <motion.span
              className="inline-block"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </motion.div>

        <motion.div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ minHeight: '420px' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 grid grid-cols-2 grid-rows-2"
            style={{
              filter: 'blur(18px)',
              transform: 'scale(1.1)',
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

          <div
            className="absolute inset-0"
            style={{ background: 'rgba(21, 66, 18, 0.5)' }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-20 h-full min-h-[420px]">
            <motion.div
              className="flex flex-col items-center gap-0"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.span
                className="inline-block bg-[#bcf0ae] text-[#002201] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8"
                variants={fadeUp}
              >
                Something exciting is cooking
              </motion.span>

              <motion.h3
                className="font-headline font-black text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                variants={fadeUp}
              >
                We're crafting something<br />you'll crave.
              </motion.h3>

              <motion.p
                className="text-white/70 max-w-md text-lg leading-relaxed mb-10"
                variants={fadeUp}
              >
                New flavours are being perfected in our kitchen — bold, clean, and made without compromise. Be the first to know when they drop.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 items-center"
                variants={fadeUp}
              >
                <motion.a
                  href="https://www.instagram.com/makhanaexpress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-[#154212] font-bold rounded-xl text-sm uppercase tracking-wide inline-block"
                  {...hoverScale}
                >
                  Follow for Updates
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
