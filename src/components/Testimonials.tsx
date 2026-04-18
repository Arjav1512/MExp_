import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkeletonTestimonialCard, SkeletonAvatar } from './Skeleton';
import { fadeUp, staggerContainerFast, viewportOptions } from '../lib/motion';

const testimonials = [
  {
    name: 'Arjav J.',
    role: 'CTO',
    text: "Needed something I could snack on during long work hours. Light and doesn't slow me down.",
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Seema A.',
    role: 'Mother',
    text: "It's rare to find a snack that's both tasty and something I trust.",
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Rohit P.',
    role: 'Fitness Enthusiast',
    text: 'Finally a snack that fits my routine — light, clean and actually satisfying. No Guilt.',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

function TestimonialCard({ testimonial, featured, index }: { testimonial: typeof testimonials[0]; featured?: boolean; index: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      className={`card-base p-6 flex flex-col ${featured ? 'lg:mt-6' : ''}`}
      variants={fadeUp}
      whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.25 }}
    >
      <Quote className="w-6 h-6 text-primary-fixed mb-4 shrink-0" aria-hidden="true" />

      <div className="flex gap-0.5 mb-4" role="img" aria-label="5 out of 5 stars">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOptions}
            transition={{ delay: 0.2 + index * 0.1 + i * 0.05, duration: 0.25, type: 'spring' }}
          >
            <Star className="w-4 h-4 fill-[#e8a000] text-[#e8a000]" aria-hidden="true" />
          </motion.div>
        ))}
      </div>

      <p className="text-[15px] text-on-surface leading-relaxed flex-1 mb-5">{testimonial.text}</p>

      <div className="flex items-center gap-3 pt-4 border-t border-surface-container-high">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-fixed shrink-0 bg-surface-container relative">
          {!imgLoaded && <SkeletonAvatar size="md" />}
          <img
            className="w-11 h-11 object-cover rounded-full"
            style={{ opacity: imgLoaded ? 1 : 0, position: imgLoaded ? 'static' : 'absolute', inset: 0 }}
            src={testimonial.image}
            alt={`Photo of ${testimonial.name}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        </div>
        <div>
          <p className="font-bold text-sm text-on-surface leading-none">{testimonial.name}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="community" className="py-20 md:py-28 px-6 md:px-8 bg-surface-dim">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-12 space-y-3"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <span className="section-label">Community</span>
          <h2
            style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)', letterSpacing: '-0.02em' }}
            className="font-headline font-black text-primary"
          >
            The Makhana Experience
          </h2>
          <p className="text-base text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Honest snacking, done right — with nothing to hide and everything to love.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          {!mounted
            ? testimonials.map((_, i) => <SkeletonTestimonialCard key={i} offset={i === 1} />)
            : testimonials.map((testimonial, i) => (
                <TestimonialCard key={i} testimonial={testimonial} featured={i === 1} index={i} />
              ))
          }
        </motion.div>
      </div>
    </section>
  );
}
