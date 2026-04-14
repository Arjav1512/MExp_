import { Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Page } from '../lib/router';
import { staggerContainer, fadeUp, viewportOnce } from '../lib/motion';

interface FooterProps {
  navigate: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.footer
      className="w-full rounded-t-[3rem] mt-16 bg-stone-100"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start px-12 py-14 max-w-[1200px] mx-auto gap-10"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.div className="space-y-4 max-w-xs" variants={fadeUp}>
          <motion.button
            className="text-lg font-bold text-green-900"
            onClick={() => navigate('home')}
            whileHover={{ opacity: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            Makhana Express
          </motion.button>
          <p className="font-body leading-relaxed text-stone-500 text-sm">
            Sourced directly from the traditional water bodies of Bihar, our makhana is carefully
            harvested and packed fresh to retain its natural quality and nutritional value.
          </p>
          <div className="flex gap-3">
            <motion.a
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
              href="https://www.instagram.com/makhanaexpress?igsh=MWRjbHR5Z3doM3BqMg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              whileHover={{ scale: 1.12, rotate: 5 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.18 }}
            >
              <Instagram className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-2 gap-10" variants={fadeUp}>
          <div className="space-y-3">
            <h4 className="font-bold text-green-900 text-sm">Explore</h4>
            <ul className="space-y-1.5">
              <li>
                <motion.button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => navigate('mission')}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                >
                  Our Story
                </motion.button>
              </li>
              <li>
                <motion.button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => handleScroll('heritage')}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                >
                  Farm-to-Bag
                </motion.button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-green-900 text-sm">Community</h4>
            <ul className="space-y-1.5">
              <li>
                <motion.button
                  className="text-stone-500 hover:text-green-700 transition-colors text-sm"
                  onClick={() => handleScroll('community')}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                >
                  Join the Community
                </motion.button>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div className="w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0" variants={fadeUp}>
          <p className="font-body leading-relaxed text-stone-500 text-sm">
            © 2026 Makhana Express. From the <span aria-hidden="true">❤️</span> of Bihar.
          </p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
