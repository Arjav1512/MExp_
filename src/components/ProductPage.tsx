import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Zap, Check, Minus, Plus, Leaf, ArrowRight, Truck, ShieldCheck,
  Dumbbell, Bone, Hand, MapPin, Heart, X, ChevronDown, PackageCheck, Sparkles, ZoomIn,
} from 'lucide-react';
import type { Page } from '../lib/router';
import {
  fetchFeaturedProduct, unitPricePer100gCents, savingsPercent,
  FREE_SHIPPING_THRESHOLD_CENTS, type Product,
} from '../lib/commerce';
import { formatINR } from '../lib/format';
import { useCart } from '../lib/cart';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, viewportOptions } from '../lib/motion';
import { trackCTAClick } from '../lib/analytics';

interface ProductPageProps {
  navigate: (page: Page) => void;
}

const CLAIM_ICONS: Record<string, typeof Leaf> = {
  'Gluten Free': ShieldCheck,
  'High Protein': Dumbbell,
  'High Calcium': Bone,
  'Plain / Unflavoured': Leaf,
  'Handpicked': Hand,
  'Sourced from Bihar': MapPin,
  'Guilt-Free Snacking': Heart,
};

export function ProductPage({ navigate }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [pincode, setPincode] = useState('');
  const [delivery, setDelivery] = useState<{ ok: boolean; message: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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

  const maxQty = product ? Math.min(50, Math.max(0, product.stock)) : 0;
  const outOfStock = !!product && product.stock <= 0;

  const handleAdd = () => {
    if (!product || outOfStock) return;
    trackCTAClick('Add to Cart', 'product-page');
    addItem(product, quantity);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!product || outOfStock) return;
    trackCTAClick('Buy Now', 'product-page');
    addItem(product, quantity);
    navigate('checkout');
  };

  const checkDelivery = () => {
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setDelivery({ ok: false, message: 'Please enter a valid 6-digit Indian pincode.' });
      return;
    }
    setDelivery({ ok: true, message: 'Delivers to your area in 3–5 business days.' });
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
  const hasDiscount = product.mrp_cents > product.price_cents;
  const savings = savingsPercent(product.mrp_cents, product.price_cents);
  const per100g = unitPricePer100gCents(product.price_cents, product.weight_grams);
  const descriptors = [product.flavour, product.dietary, 'Big Size', 'Handpicked'].filter(Boolean);

  const specs: { label: string; value: string }[] = [
    { label: 'Net quantity', value: product.pack_size || `${product.weight_grams} g` },
    { label: 'Net weight', value: `${product.weight_grams} g` },
    { label: 'Flavour', value: product.flavour },
    { label: 'Generic name', value: product.generic_name },
    { label: 'Diet type', value: product.dietary },
    { label: 'Package dimensions', value: product.dimensions },
    { label: 'Package weight', value: product.package_weight_grams > 0 ? `${product.package_weight_grams} g` : '' },
    { label: 'Country of origin', value: product.origin },
    { label: 'Manufacturer', value: product.manufacturer },
    { label: 'Packed by', value: product.packer },
    { label: 'Storage', value: product.storage },
    { label: 'Shelf life', value: product.shelf_life },
  ].filter((s) => s.value);

  const faqs: { q: string; a: string }[] = [
    { q: 'What exactly is inside the pack?', a: `Just one ingredient: ${product.ingredients.join(', ')}. No oil, no salt, no flavouring, no preservatives — plain, unflavoured phool makhana.` },
    { q: 'How much do I get?', a: `Each pack is ${product.pack_size || `${product.weight_grams} g`} of big-size, handpicked makhana.` },
    { q: 'Is it vegetarian and gluten-free?', a: 'Yes. It is a vegetarian product and is labelled gluten free on the pack.' },
    { q: 'How should I eat it?', a: product.how_to_use.join(' ') },
    { q: 'Where is it sourced from?', a: `Handpicked and sourced from Bihar, India. Manufactured and packed by ${product.manufacturer}.` },
    { q: 'How is it delivered and paid for?', a: `We ship across India in 3–5 business days. Shipping is free over ${formatINR(FREE_SHIPPING_THRESHOLD_CENTS)}, and Cash on Delivery is available at checkout.` },
  ].filter((f) => f.a);

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-8 pb-6">
        <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant" aria-label="Breadcrumb">
          <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Home</button>
          <span>/</span>
          <span className="text-on-surface">Shop</span>
          <span>/</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <motion.div className="lg:sticky lg:top-[92px] space-y-4" variants={fadeLeft} initial="hidden" animate="visible">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface-container group cursor-zoom-in"
            style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.12)' }}
            aria-label="Expand product image"
          >
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
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3" /> Fresh batch
            </span>
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-black/55 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3.5 h-3.5" /> Tap to zoom
            </span>
          </button>

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
                  aria-current={i === activeImage}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Purchase panel */}
        <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="space-y-3">
            <span className="section-label">{product.brand}</span>
            <h1
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)', letterSpacing: '-0.02em', lineHeight: '1' }}
              className="font-headline font-black text-primary"
            >
              {product.name}
            </h1>
            <p className="text-on-surface font-semibold text-lg leading-snug">{product.tagline}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {descriptors.map((d) => (
                <span key={d} className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                  {d}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-2">
            <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
              <span className="font-headline font-black text-primary text-4xl">{formatINR(product.price_cents)}</span>
              {hasDiscount && (
                <>
                  <span className="text-on-surface-variant text-lg line-through">{formatINR(product.mrp_cents)}</span>
                  <span className="inline-flex items-center bg-primary text-on-primary text-xs font-bold px-2.5 py-1 rounded-full">
                    {savings}% off
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {hasDiscount && (
                <span className="font-semibold text-primary">You save {formatINR(product.mrp_cents - product.price_cents)}</span>
              )}
              {per100g > 0 && (
                <span className="text-on-surface-variant">{formatINR(per100g)} / 100 g</span>
              )}
              <span className="text-on-surface-variant">{product.pack_size}</span>
            </div>
            <p className="text-xs text-on-surface-variant">MRP inclusive of all taxes. {hasDiscount ? `MRP ${formatINR(product.mrp_cents)}.` : ''}</p>
          </motion.div>

          <motion.p variants={fadeUp} className="text-on-surface-variant leading-relaxed max-w-lg">
            {product.description}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {product.claims.map((c) => {
              const Icon = CLAIM_ICONS[c] ?? Check;
              return (
                <span key={c} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-fixed/50 px-3 py-1.5 rounded-full border border-primary-fixed">
                  <Icon className="w-3 h-3" /> {c}
                </span>
              );
            })}
          </motion.div>

          {/* Quantity + CTAs */}
          {outOfStock ? (
            <motion.div variants={fadeUp} className="rounded-xl bg-surface-container p-4 text-sm font-semibold text-on-surface-variant">
              This product is currently out of stock. Please check back soon.
            </motion.div>
          ) : (
            <>
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
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-40"
                    disabled={quantity >= maxQty}
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
            </>
          )}

          {/* Delivery / availability */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Truck className="w-4 h-4 text-primary" /> Check delivery
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setDelivery(null); }}
                placeholder="Enter 6-digit pincode"
                aria-label="Delivery pincode"
              />
              <button onClick={checkDelivery} className="btn-secondary px-5 shrink-0">Check</button>
            </div>
            {delivery && (
              <p className={`text-sm font-medium ${delivery.ok ? 'text-primary' : 'text-error'}`}>{delivery.message}</p>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD_CENTS)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">Cash on Delivery available</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Why Makhana Express */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-8 pb-4">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-center space-y-2 mb-8">
          <span className="section-label mx-auto">Why Makhana Express</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }} className="font-headline font-black text-primary">What makes this pack different</h2>
        </motion.div>
        <motion.div className="grid grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOptions}>
          {product.benefits.map((b) => (
            <motion.div key={b} variants={fadeUp} className="flex items-start gap-3 bg-surface-container-lowest rounded-2xl border border-surface-container-high p-5">
              <span className="w-9 h-9 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
              </span>
              <span className="font-semibold text-on-surface text-sm leading-snug">{b}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Ingredients + Nutrition */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-8 space-y-5"
          variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewportOptions}
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
            A single-ingredient snack — just plain, handpicked makhana. Nothing else is added.
          </p>
        </motion.div>

        <motion.div
          className="bg-primary text-on-primary rounded-2xl p-8 space-y-5"
          variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewportOptions}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="font-headline font-black text-xl">Nutrition</h2>
            {product.nutrition_basis && <span className="text-on-primary/70 text-xs font-bold uppercase tracking-wide">{product.nutrition_basis}</span>}
          </div>
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

      {/* Specifications + How to use */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-8 pb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-8 space-y-4"
          variants={fadeLeft} initial="hidden" whileInView="visible" viewport={viewportOptions}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline font-black text-xl text-on-surface">Product details</h2>
          </div>
          <dl className="divide-y divide-surface-container-high">
            {specs.map((s) => (
              <div key={s.label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-on-surface-variant">{s.label}</dt>
                <dd className="text-sm font-semibold text-on-surface text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-8 space-y-4"
          variants={fadeRight} initial="hidden" whileInView="visible" viewport={viewportOptions}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-headline font-black text-xl text-on-surface">How to enjoy</h2>
          </div>
          <ol className="space-y-3">
            {product.how_to_use.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-on-surface font-medium text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      {/* Story */}
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

      {/* FAQ */}
      <section className="max-w-[820px] mx-auto px-6 md:px-8 py-16">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOptions} className="text-center space-y-2 mb-8">
          <span className="section-label mx-auto">Good to know</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }} className="font-headline font-black text-primary">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="bg-surface-container-lowest rounded-2xl border border-surface-container-high overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-bold text-on-surface">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-5 text-on-surface-variant leading-relaxed text-sm">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            role="dialog" aria-label="Product image preview"
          >
            <button
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(false)}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              key={activeImage}
              src={gallery[activeImage]}
              alt={`${product.name} — enlarged view`}
              className="max-w-full max-h-full rounded-2xl object-contain"
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
