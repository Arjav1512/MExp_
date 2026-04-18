import { ArrowLeft, Droplets, Hand, Leaf, ShieldCheck, Heart, Sprout, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Page } from '../lib/router';
import { fadeUp, fadeRight, staggerContainer, staggerContainerFast, viewportOptions } from '../lib/motion';

interface OurMissionProps {
  navigate: (page: Page) => void;
  onShopCTA: () => void;
}

const values = [
  {
    icon: Hand,
    title: 'People First',
    description:
      'Every bag you buy directly supports the farming families of Bihar who have cultivated makhana by hand for over a thousand years. We pay fair, always.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing Hidden',
    description:
      'No additives, no shortcuts, no fine print. What you see on the label is everything that is in the bag — and nothing that is not.',
  },
  {
    icon: Droplets,
    title: 'Rooted in Nature',
    description:
      'Makhana grows in freshwater lotus ponds, untouched by industrial farming. We let nature lead and keep our process as clean as the water it grows in.',
  },
  {
    icon: Leaf,
    title: 'Sustainably Sourced',
    description:
      'Lotus ponds are self-sustaining ecosystems. By choosing makhana, you choose a crop that gives back to the earth rather than depleting it.',
  },
];

const impacts = [
  { stat: '200+', label: 'Farming Families Supported' },
  { stat: '100%', label: 'Traceable Farm-to-Bag' },
  { stat: '0', label: 'Artificial Additives' },
  { stat: '1000+', label: 'Years of Tradition' },
];

export function OurMission({ navigate, onShopCTA }: OurMissionProps) {
  return (
    <div className="min-h-screen pt-[68px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-8 pb-4">
        <motion.button
          onClick={() => { navigate('home'); window.scrollTo({ top: 0 }); }}
          className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors group"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </motion.button>
      </div>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="section-label" variants={fadeUp}>
              <Sprout className="w-3.5 h-3.5" />
              Our Mission
            </motion.span>
            <motion.h1
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: '0.95' }}
              className="font-headline font-black text-primary"
              variants={fadeUp}
            >
              Snack Better.<br />Choose Better.
            </motion.h1>
            <div className="divider" />
            <motion.p
              className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-lg"
              variants={fadeUp}
            >
              We started Makhana Express to bring snacking back to its roots — pure makhana from Bihar's ponds, handled with care, and nothing added along the way.
            </motion.p>
            <motion.button
              onClick={onShopCTA}
              className="btn-primary text-[15px] px-8 py-3.5"
              variants={fadeUp}
              whileHover={{ scale: 1.03, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="w-4 h-4" />
              Shop Better Snacks
            </motion.button>
          </motion.div>

          <motion.div
            className="relative"
            variants={fadeRight}
            initial="hidden"
            animate="visible"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square w-full max-w-md mx-auto shadow-2xl">
              <img
                src="/generated-1775775918458-v7v8t.webp"
                alt="Farmer harvesting makhana in a Bihar lotus pond"
                className="w-full h-full object-cover"
                loading="lazy"
                width={448}
                height={448}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-bold text-sm leading-snug">
                  Bihar's lotus ponds — where every seed begins its journey.
                </p>
              </div>
            </div>
            <motion.div
              className="absolute -top-4 -right-4 md:-top-5 md:-right-5 w-20 h-20 md:w-24 md:h-24 bg-primary-fixed rounded-2xl flex flex-col items-center justify-center text-center shadow-xl rotate-3"
              initial={{ scale: 0, rotate: 12 }}
              animate={{ scale: 1, rotate: 3 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 22 }}
            >
              <span className="text-lg font-black text-primary leading-none">Pure</span>
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wide mt-0.5">Always</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-primary py-14 md:py-20 px-6 md:px-8">
        <div className="max-w-[860px] mx-auto text-center space-y-5">
          <h2
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.02em' }}
            className="font-headline font-black text-on-primary leading-tight"
          >
            The best snack is one you can trust — what's in it, and where it comes from.
          </h2>
          <p className="text-on-primary/65 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            We're bringing Bihar's ancient superfood to modern kitchens, while preserving the traditions and communities behind it.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="section-label">Impact</span>
            <h2
              style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-primary"
            >
              Proof, Not Promises
            </h2>
            <p className="text-on-surface-variant text-base">Real impact, measured honestly.</p>
          </div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            {impacts.map((item) => (
              <motion.div
                key={item.stat}
                className="card-base p-6 text-center"
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
              >
                <p
                  className="font-headline font-black text-primary mb-1.5 leading-none"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  {item.stat}
                </p>
                <p className="text-on-surface-variant text-sm font-medium leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-20 px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="section-label">Values</span>
            <h2
              style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
              className="font-headline font-black text-primary"
            >
              What We Believe In
            </h2>
            <p className="text-on-surface-variant text-base">Every decision we make starts here.</p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="card-base p-6 flex gap-4"
                  variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-[15px] text-on-surface">{value.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Cause Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative min-h-[300px] lg:min-h-full">
                <img
                  src="/generated-1775776028886-nt5g5.webp"
                  alt="Bihar makhana farming community members at work"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  width={600}
                  height={400}
                />
                <div className="absolute inset-0 bg-primary/25" />
              </div>
              <div className="bg-surface-container-lowest p-8 md:p-12 flex flex-col justify-center space-y-5">
                <span className="section-label self-start">Fair Trade</span>
                <h2
                  style={{ fontSize: 'clamp(1.625rem, 2.75vw, 2.25rem)', letterSpacing: '-0.02em' }}
                  className="font-headline font-black text-primary leading-tight"
                >
                  Better for You. Fairer for Them.
                </h2>
                <div className="divider" />
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed">
                  Bihar's makhana farmers come from some of India's most underserved communities. Their craft demands skill, strength, and generations of knowledge — yet for years, middlemen took most of the value.
                </p>
                <p className="text-on-surface-variant text-sm md:text-[15px] leading-relaxed">
                  We work directly with farming cooperatives to change that. No layers, no exploitation — just fair pay, transparency, and respect for the people behind every harvest.
                </p>
                <div className="pt-1">
                  <span className="section-label">When we grow, our farmers grow with us.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-6 md:px-8">
        <div className="max-w-[680px] mx-auto text-center space-y-6">
          <h2
            style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)', letterSpacing: '-0.02em' }}
            className="font-headline font-black text-primary leading-tight"
          >
            Snack Better. Choose Better.
          </h2>
          <p className="text-on-surface-variant text-base max-w-md mx-auto leading-relaxed">
            Every bag supports clean ingredients, fair trade, and the farmers behind it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onShopCTA} className="btn-primary text-[15px] px-8 py-3.5">
              Shop Now
            </button>
            <button
              onClick={() => {
                navigate('home');
                setTimeout(() => {
                  document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' });
                }, 120);
              }}
              className="btn-secondary text-[15px] px-8 py-3.5 inline-flex items-center gap-2 group"
            >
              Join the Community
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
