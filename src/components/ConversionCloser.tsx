import { ShoppingBag, Leaf, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainerFast, staggerContainer, viewportOptions } from '../lib/motion';

interface ConversionCloserProps {
  onShopCTA: () => void;
}

const pillars = [
  { icon: Leaf, text: 'No preservatives. Ever.' },
  { icon: Zap, text: 'Fresh batches made weekly.' },
  { icon: ShoppingBag, text: 'Delivered sealed, straight from Bihar.' },
];

export function ConversionCloser({ onShopCTA }: ConversionCloserProps) {
  return (
    <section className="py-20 md:py-24 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-center space-y-8">
        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <motion.span className="section-label" variants={fadeUp}>The decision is easy</motion.span>
          <motion.h2
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em' }}
            className="font-headline font-black text-primary leading-[1.0]"
            variants={fadeUp}
          >
            Ready to snack better?
          </motion.h2>
          <motion.p
            className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md mx-auto"
            variants={fadeUp}
          >
            Clean, crunchy, and made fresh for you. No compromise on ingredients.
            No regret after eating.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-2.5 justify-center items-center"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          {pillars.map(({ icon: Icon, text }) => (
            <motion.div
              key={text}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container border border-surface-container-high"
              variants={fadeUp}
              whileHover={{ scale: 1.04, y: -2 }}
            >
              <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-on-surface">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2.5"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <motion.button
            onClick={onShopCTA}
            className="inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-black text-base px-12 py-4 rounded-xl"
            style={{ boxShadow: '0 6px 28px rgba(21,66,18,0.38), 0 1px 4px rgba(21,66,18,0.2)' }}
            whileHover={{ scale: 1.04, filter: 'brightness(1.09)' }}
            whileTap={{ scale: 0.96 }}
          >
            <ShoppingBag className="w-5 h-5" />
            Order Your Pack
          </motion.button>
          <p className="text-[11px] text-on-surface-variant/60 font-medium">
            Fresh batches made weekly · Sealed at source · 100% natural
          </p>
        </motion.div>
      </div>
    </section>
  );
}
