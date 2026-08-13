import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Check, Minus, Plus, Leaf, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import type { Page } from '../lib/router';
import { fetchFeaturedProduct, type Product } from '../lib/commerce';
import { formatINR } from '../lib/format';
import { useCart } from '../lib/cart';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, viewportOptions } from '../lib/motion';
import { trackCTAClick } from '../lib/analytics';

interface ProductPageProps {
  navigate: (page: Page) => void;
}

export function ProductPage({ navigate }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    let alive = true;
    fetchFeaturedProduct()
      .then((p) => {
        if (!alive) return;
        if (!p) { setFailed(true); return; }
        setProduct(p);
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const handleAdd = () => {
    if (!product) return;
    trackCTAClick('Add to Cart', 'product-page');
    addItem(product, quantity);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    trackCTAClick('Buy Now', 'product-page');
    addItem(product, quantity);
    navigate('checkout');
  };

  if (loading) {
    return (
      <div className="pt-[68px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-6 w-32 rounded-full skeleton-shimmer" />
            <div className="h-12 w-3/4 rounded-lg skeleton-shimmer" />
            <div className="h-24 w-full rounded-lg skeleton-shimmer" />
            <div className="h-12 w-40 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (failed || !product) {
    return (
      <div className="pt-[68px] min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="font-headline font-black text-2xl text-primary">Product unavailable</h1>
          <p className="text-on-surface-variant">We couldn't load the product right now. Please try again shortly.</p>
          <button className="btn-primary" onClick={() => navigate('home')}>Back to home</button>
        </div>
      </div>
    );
  }

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image_url];

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-8 pb-6">
        <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant" aria-label="Breadcrumb">
          <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Home</button>
          <span>/</span>
          <span className="text-on-surface">Shop</span>
        </nav>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <motion.div
          className="lg:sticky lg:top-[92px] space-y-4"
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container group" style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.12)' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={gallery[activeImage]}
                alt={`${product.name} — view ${activeImage + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3" /> Fresh batch
              </span>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    i === activeImage ? 'border-primary' : 'border-transparent hover:border-outline/40'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <span className="section-label">The Product</span>
            <h1
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)', letterSpacing: '-0.02em', lineHeight: '1' }}
              className="font-headline font-black text-primary"
            >
              {product.name}
            </h1>
            <p className="text-on-surface font-semibold text-lg leading-snug">{product.tagline}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-baseline gap-3">
            <span className="font-headline font-black text-primary text-3xl">{formatINR(product.price_cents)}</span>
            <span className="text-on-surface-variant text-sm font-medium">/ {product.weight_grams}g pack</span>
          </motion.div>

          <motion.p variants={fadeUp} className="text-on-surface-variant leading-relaxed max-w-lg">
            {product.description}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {product.benefits.slice(0, 4).map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-fixed/50 px-3 py-1.5 rounded-full border border-primary-fixed">
                <Check className="w-3 h-3" /> {b}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
            <div className="inline-flex items-center rounded-xl border-2 border-outline/30 overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-on-surface tabular-nums" aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="w-11 h-11 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-on-surface-variant font-medium">
              {formatINR(product.price_cents * quantity)} total
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-1">
            <motion.button
              onClick={handleAdd}
              className="btn-primary flex-1 py-4 text-base relative overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(21,66,18,0.28)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <Check className="w-4 h-4" /> Added to cart
                  </motion.span>
                ) : (
                  <motion.span key="add" className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              onClick={handleBuyNow}
              className="btn-secondary flex-1 py-4 text-base group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Buy Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Free shipping over {formatINR(49900)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Sealed fresh at source</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-8 pb-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-8 space-y-5"
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline font-black text-xl text-on-surface">Ingredients</h2>
          </div>
          <ul className="space-y-2.5">
            {product.ingredients.map((ing) => (
              <li key={ing} className="flex items-center gap-3 text-on-surface font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
                {ing}
              </li>
            ))}
          </ul>
          <p className="text-on-surface-variant text-sm leading-relaxed pt-2 border-t border-surface-container-high">
            That's the entire list. No oils, no flavour enhancers, no preservatives — the way a snack should be.
          </p>
        </motion.div>

        <motion.div
          className="bg-primary text-on-primary rounded-2xl p-8 space-y-5"
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <h2 className="font-headline font-black text-xl">Nutrition</h2>
          <div className="divide-y divide-white/15">
            {product.nutrition.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5">
                <span className="text-on-primary/80 text-sm font-medium">{row.label}</span>
                <span className="font-bold tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-surface-container-lowest border-y border-surface-container-high">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-16 text-center space-y-5">
          <span className="section-label mx-auto">Our Story</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }} className="font-headline font-black text-primary leading-tight max-w-2xl mx-auto">
            From the ponds of Bihar to your pantry
          </h2>
          <p className="text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            Every foxnut is hand-harvested, sun-dried, and roasted in small batches by farming families
            who've perfected the craft over generations. When you snack with us, you support them too.
          </p>
          <button onClick={() => navigate('mission')} className="btn-secondary inline-flex items-center gap-2 group mx-auto">
            Read our mission
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
