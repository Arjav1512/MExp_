import { motion } from 'framer-motion';
import { Instagram, ArrowUpRight, Camera } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { instagramConfig } from '../../lib/integrations';
import { fadeUp, staggerContainerFast, viewportOptions } from '../../lib/motion';

export function InstagramShowcase() {
  const cfg = instagramConfig();

  return (
    <section id="instagram" className="py-16 md:py-20 px-6 md:px-8 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeading
          label="On Instagram"
          title="Join the makhana community"
          description="Real snackers, real moments. Follow along and tag us — genuine creator features appear here once our official Instagram feed is connected."
        />

        <motion.div
          className="card-base overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </span>
              <span className="font-headline font-black text-lg text-on-surface">@{cfg.handle}</span>
            </div>
            <h3 className="font-headline font-black text-2xl md:text-3xl text-primary leading-tight mb-3">
              Follow us for fresh drops & recipes
            </h3>
            <p className="text-on-surface-variant leading-relaxed mb-7">
              Behind-the-scenes, snack ideas, and the community we're building — all on our official page. Nothing here is staged or fabricated.
            </p>
            <a
              href={cfg.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary self-start"
            >
              <Instagram className="w-4 h-4" /> Follow @{cfg.handle}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-surface-container-low p-8 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-surface-container-high">
            <motion.div
              className="grid grid-cols-3 gap-3 mb-6"
              variants={staggerContainerFast}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="aspect-square rounded-xl bg-surface-container-high flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Camera className="w-6 h-6 text-on-surface-variant/40" />
                </motion.div>
              ))}
            </motion.div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">Live feed coming soon.</span> To keep everything authentic, we only display real posts through Instagram's official embed. Once connected, the latest posts and approved creator features will show here automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
