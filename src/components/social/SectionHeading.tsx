import { motion } from 'framer-motion';
import { fadeUp, viewportOptions } from '../../lib/motion';

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeading({ label, title, description }: SectionHeadingProps) {
  return (
    <motion.div
      className="text-center mb-10 space-y-3"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
    >
      <span className="section-label">{label}</span>
      <h2
        style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)', letterSpacing: '-0.02em' }}
        className="font-headline font-black text-primary"
      >
        {title}
      </h2>
      {description && (
        <p className="text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
