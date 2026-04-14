import type { Variants } from 'framer-motion';

export const durations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
};

export const easings = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  spring: { type: 'spring', stiffness: 300, damping: 28 },
  springGentle: { type: 'spring', stiffness: 200, damping: 24 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.smooth },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: easings.smooth },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: easings.smooth },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const heroTextVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export const modalVariant: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: easings.springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 16,
    transition: { duration: 0.2, ease: easings.smooth },
  },
};

export const backdropVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const mobileMenuVariant: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.22, ease: easings.smooth },
  },
};

export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } },
  whileTap: { scale: 0.97 },
};

export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.18 } },
  whileTap: { scale: 0.96 },
};

export const viewportOnce = { once: true, amount: 0.2 } as const;
