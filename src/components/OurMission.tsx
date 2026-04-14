import { ArrowLeft, Droplets, Hand, Leaf, ShieldCheck, Heart, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Page } from '../lib/router';
import { fadeUp, fadeLeft, fadeRight, scaleIn, staggerContainer, hoverScale, viewportOnce } from '../lib/motion';

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
    <motion.div
      className="min-h-screen pt-24 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back nav */}
      <div className="max-w-[1200px] mx-auto px-8 mb-10">
        <motion.button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors group"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileHover={{ x: -3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      </div>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full"
              variants={fadeUp}
            >
              <Sprout className="w-3.5 h-3.5" />
              Our Mission
            </motion.span>
            <motion.h1
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)' }}
              className="font-headline font-black text-primary leading-[1.0] tracking-tighter"
              variants={fadeUp}
            >
              Snack Better. Choose Better.
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-lg"
              variants={fadeUp}
            >
              We started Makhana Express to bring snacking back to its roots—pure makhana from Bihar's ponds, handled with care, and nothing added along the way.
            </motion.p>
            <motion.div variants={fadeUp}>
              <motion.button
                onClick={onShopCTA}
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 text-sm"
                {...hoverScale}
              >
                <Heart className="w-4 h-4" />
                Shop Better Snacks
              </motion.button>
            </motion.div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-sm leading-snug">
                  Bihar's lotus ponds — where every seed begins its journey.
                </p>
              </div>
            </div>
            <motion.div
              className="absolute -top-5 -right-5 w-24 h-24 bg-primary-fixed rounded-full flex flex-col items-center justify-center text-center shadow-xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span className="text-xl font-black text-on-primary-fixed leading-none">Pure</span>
              <span className="text-[10px] font-bold text-on-primary-fixed/70 uppercase tracking-wide">Always</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <motion.section
        className="bg-primary py-16 px-8 mb-20"
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <div className="max-w-[900px] mx-auto text-center space-y-6">
          <motion.h2
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            className="font-headline font-black text-on-primary leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            The best snack is one you can trust—what's in it, and where it comes from.
          </motion.h2>
          <motion.p
            className="text-on-primary/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            We're bringing Bihar's ancient superfood to modern kitchens, while preserving the traditions and communities behind it.
          </motion.p>
        </div>
      </motion.section>

      {/* Impact Stats */}
      <section className="max-w-[1200px] mx-auto px-8 mb-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)' }}
            className="font-headline font-black text-primary mb-2"
          >
            Proof, Not Promises
          </h2>
          <p className="text-on-surface-variant text-base">
            Real impact, measured honestly.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {impacts.map((item) => (
            <motion.div
              key={item.stat}
              className="bg-surface-container rounded-2xl p-6 text-center"
              variants={fadeUp}
              whileHover={{
                y: -4,
                boxShadow: '0 12px 28px rgba(0,0,0,0.10)',
                transition: { duration: 0.2 },
              }}
            >
              <p className="font-headline font-black text-primary mb-1.5" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {item.stat}
              </p>
              <p className="text-on-surface-variant text-sm font-medium leading-snug">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="max-w-[1200px] mx-auto px-8 mb-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)' }}
            className="font-headline font-black text-primary mb-2"
          >
            What We Believe In
          </h2>
          <p className="text-on-surface-variant text-base">
            Every decision we make starts here.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                className="flex gap-4 bg-surface-container-lowest border border-surface-container-high p-6 rounded-2xl"
                variants={fadeUp}
                whileHover={{
                  y: -3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0"
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 0.18 }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-on-surface">{value.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Cause Section */}
      <section className="max-w-[1200px] mx-auto px-8 mb-20">
        <motion.div
          className="bg-surface-container-low rounded-2xl overflow-hidden"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <motion.div
              className="relative min-h-[320px] lg:min-h-full"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <img
                src="/generated-1775776028886-nt5g5.webp"
                alt="Bihar makhana farming community members at work"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                width={600}
                height={400}
              />
              <div className="absolute inset-0 bg-primary/30" />
            </motion.div>
            <motion.div
              className="p-8 md:p-12 flex flex-col justify-center space-y-5"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <h2
                style={{ fontSize: 'clamp(1.625rem, 2.75vw, 2.25rem)' }}
                className="font-headline font-black text-primary leading-tight"
              >
                Better for You. Fairer for Them.
              </h2>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                Bihar's makhana farmers come from some of India's most underserved communities. Their craft demands skill, strength, and generations of knowledge—yet for years, middlemen took most of the value.
              </p>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                We work directly with farming cooperatives to change that. No layers, no exploitation—just fair pay, transparency, and respect for the people behind every harvest.
              </p>
              <div className="pt-2">
                <span className="inline-block bg-primary-fixed text-on-primary-fixed font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full">
                  When we grow, our farmers grow with us.
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section
        className="max-w-[800px] mx-auto px-8 text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          style={{ fontSize: 'clamp(1.875rem, 3.25vw, 2.5rem)' }}
          className="font-headline font-black text-primary mb-4 leading-tight"
        >
          Snack Better. Choose Better.
        </h2>
        <p className="text-on-surface-variant text-base mb-8 max-w-md mx-auto leading-relaxed">
          Every bag supports clean ingredients, fair trade, and the farmers behind it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={onShopCTA}
            className="bg-primary text-on-primary font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 text-sm"
            {...hoverScale}
          >
            Shop Now
          </motion.button>
          <motion.button
            onClick={() => {
              navigate('home');
              setTimeout(() => {
                document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="border-2 border-outline text-on-surface font-bold px-8 py-3.5 rounded-xl hover:bg-surface-container transition-colors text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Join the Community
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
}
