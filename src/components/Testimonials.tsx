import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkeletonTestimonialCard, SkeletonAvatar } from './Skeleton';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

const testimonials = [
  {
    name: 'Arjav J.',
    role: 'CTO',
    text: "Needed something I could snack on during long work hours. Light and doesn't slow me down.",
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Seema A.',
    role: 'Mother',
    text: "It's rare to find a snack that's both tasty and something I trust.",
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Ruder P.',
    role: 'Fitness Enthusiast',
    text: 'Finally a snack that fits my routine-light, clean and actually satisfying. No Guilt.',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

function TestimonialCard({ testimonial, offset }: { testimonial: typeof testimonials[0]; offset?: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      className={`bg-surface-container-lowest p-5 rounded-lg shadow-sm relative group ${
        offset ? 'mt-0 md:mt-5' : ''
      }`}
      variants={fadeUp}
      whileHover={{
        y: -6,
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        transition: { duration: 0.22 },
      }}
    >
      <div className="flex gap-1 text-tertiary mb-3" role="img" aria-label="5 out of 5 stars">
        {[...Array(5)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ delay: i * 0.06, duration: 0.2, type: 'spring' }}
          >
            <Star className="w-4 h-4 fill-current" aria-hidden="true" />
          </motion.span>
        ))}
      </div>

      <p className="text-sm font-medium text-on-surface mb-5 leading-[1.5]">{testimonial.text}</p>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-fixed relative shrink-0">
          {!imgLoaded && <SkeletonAvatar size="md" />}
          <img
            className="w-11 h-11 object-cover rounded-full"
            style={{ opacity: imgLoaded ? 1 : 0, position: imgLoaded ? 'static' : 'absolute', inset: 0 }}
            src={testimonial.image}
            alt={`Photo of ${testimonial.name}, ${testimonial.role}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        </div>
        <div>
          <p className="font-bold text-primary text-sm">{testimonial.name}</p>
          <p className="text-xs text-on-surface-variant">{testimonial.role}</p>
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
    <section id="community" className="py-16 px-8 bg-surface-dim relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.75vw, 2.75rem)' }} className="font-headline font-black text-primary mb-2.5">
            The Makhana Experience
          </h2>
          <p className="text-base text-on-surface-variant">
            Honest snacking, done right with nothing to hide and everything to love.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {!mounted
            ? testimonials.map((_, i) => (
                <SkeletonTestimonialCard key={i} offset={i === 1} />
              ))
            : testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} offset={index === 1} />
              ))
          }
        </motion.div>
      </div>
    </section>
  );
}
