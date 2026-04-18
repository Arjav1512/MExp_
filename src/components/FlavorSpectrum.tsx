import { ArrowRight, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, scaleIn, staggerContainer, viewportOptions } from '../lib/motion';

interface FlavorSpectrumProps {
  onShopCTA: () => void;
}

export function FlavorSpectrum({ onShopCTA }: FlavorSpectrumProps) {
  return (
    <section id="shop" className="py-20 md:py-28 px-6 md:px-8 bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <motion.div className="space-y-3 max-w-xl" variants={fadeLeft}>
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
          </motion.div>
          <motion.button
            onClick={onShopCTA}
            className="text-primary font-bold flex items-center gap-2 group text-sm hover:text-primary/70 transition-colors shrink-0"
            variants={fadeRight}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Flavors (Coming Soon)
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        <motion.div
          className="relative w-full rounded-2xl overflow-hidden bg-primary"
          style={{ minHeight: '400px' }}
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <div
            className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30"
            style={{ filter: 'blur(12px)', transform: 'scale(1.08)' }}
          >
            {[
              '/1st.png',
              '/2nd.jpeg',
              '/3rd.png',
              '/1st.png',
            ].map((src, i) => (
              <div
                key={i}
                className="bg-cover bg-center"
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/80" />

          <motion.div
            className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-20 min-h-[400px]"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <motion.span
              className="inline-block bg-primary-fixed text-on-primary-fixed text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-7"
              variants={fadeUp}
            >
              Something exciting is cooking
            </motion.span>

            <motion.h3
              className="font-headline font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.875rem, 4.5vw, 3rem)', letterSpacing: '-0.02em' }}
              variants={fadeUp}
            >
              We're crafting something<br />you'll crave.
            </motion.h3>

            <motion.p
              className="text-white/65 max-w-md text-base leading-relaxed mb-10"
              variants={fadeUp}
            >
              New flavours are being perfected in our kitchen — bold, clean, and made without compromise. Be the first to know when they drop.
            </motion.p>

            <motion.a
              href="https://www.instagram.com/makhanaexpress"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-primary font-bold rounded-xl text-sm"
              variants={fadeUp}
              whileHover={{ scale: 1.05, backgroundColor: '#e6f4e6' }}
              whileTap={{ scale: 0.97 }}
            >
              <Instagram className="w-4 h-4" />
              Follow for Updates
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
