import { motion } from 'framer-motion';
import { ExternalLink, Package, Info } from 'lucide-react';
import { amazonConfig } from '../../lib/integrations';
import { fadeUp, fadeLeft, fadeRight, viewportOptions } from '../../lib/motion';
import { SectionHeading } from './SectionHeading';

interface AmazonReviewsProps {
  productName: string;
  productImage: string;
}

export function AmazonReviews({ productName, productImage }: AmazonReviewsProps) {
  const cfg = amazonConfig();

  return (
    <section className="py-16 md:py-20 px-6 md:px-8 bg-background">
      <div className="max-w-[1100px] mx-auto">
        <SectionHeading
          label="On Amazon"
          title="Also loved on the marketplace"
          description="Find the exact same hand-harvested makhana on Amazon, with the convenience of Prime delivery."
        />

        <motion.div
          className="card-base overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <motion.div
            className="bg-surface-container flex items-center justify-center p-8"
            variants={fadeLeft}
          >
            <img
              src={productImage}
              alt={productName}
              className="w-full max-w-[200px] aspect-square object-contain rounded-xl"
              loading="lazy"
              decoding="async"
              width={200}
              height={200}
            />
          </motion.div>

          <motion.div className="p-6 md:p-8 flex flex-col" variants={fadeRight}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              <Package className="w-4 h-4 text-tertiary" />
              Sold on {cfg.marketplace.replace('www.', '')}
            </div>

            <h3 className="font-headline font-black text-xl md:text-2xl text-on-surface leading-tight mb-1">
              {productName}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">250 g pack · ASIN {cfg.asin}</p>

            {/* Ratings are only shown when a legitimate Amazon data source is connected.
                We never fabricate a star count or review text. */}
            <div className="flex items-start gap-2.5 bg-surface-container-low rounded-xl px-4 py-3 mb-6">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Live Amazon ratings and verified review excerpts appear here once the official Amazon
                integration is connected. Until then, tap through to read every review on the Amazon listing.
              </p>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <a
                href={cfg.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ background: '#232f3e' }}
              >
                View on Amazon
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={`${cfg.productUrl}#customerReviews`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Read Amazon reviews
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
