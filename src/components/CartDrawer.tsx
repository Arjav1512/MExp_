import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../lib/cart';
import { formatINR } from '../lib/format';
import { shippingFor, FREE_SHIPPING_THRESHOLD_CENTS } from '../lib/commerce';
import type { Page } from '../lib/router';

interface CartDrawerProps {
  navigate: (page: Page) => void;
}

export function CartDrawer({ navigate }: CartDrawerProps) {
  const { items, isOpen, closeCart, subtotalCents, setQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const shipping = shippingFor(subtotalCents);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;

  const goToCheckout = () => {
    closeCart();
    navigate('checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-[61] flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-surface-container-high shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-headline font-black text-lg text-primary">Your Cart</h2>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-on-surface-variant" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-on-surface">Your cart is empty</p>
                  <p className="text-sm text-on-surface-variant">Add some fresh makhana to get started.</p>
                </div>
                <button
                  onClick={() => { closeCart(); navigate('product'); }}
                  className="btn-primary mt-2"
                >
                  Shop Makhana
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  {subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS && (
                    <div className="rounded-xl bg-primary-fixed/40 border border-primary-fixed px-4 py-3 text-sm text-primary font-semibold">
                      Add {formatINR(remaining)} more for free shipping
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.product_id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 bg-surface-container-lowest rounded-2xl border border-surface-container-high p-3"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface text-sm truncate">{item.name}</p>
                              <p className="text-xs text-on-surface-variant">{item.pack_size || `${item.weight_grams}g pack`}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-on-surface-variant hover:text-error transition-colors p-1 -mr-1 -mt-1"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-outline/30 overflow-hidden">
                              <button
                                onClick={() => setQuantity(item.product_id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => setQuantity(item.product_id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="font-bold text-primary tabular-nums">{formatINR(item.price_cents * item.quantity)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-surface-container-high px-6 py-5 space-y-4 shrink-0 bg-surface-container-low">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span className="font-semibold text-on-surface tabular-nums">{formatINR(subtotalCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Shipping</span>
                      <span className="font-semibold text-on-surface tabular-nums">{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-base pt-2 border-t border-surface-container-high">
                      <span className="font-bold text-on-surface">Total</span>
                      <span className="font-headline font-black text-primary tabular-nums">{formatINR(subtotalCents + shipping)}</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={goToCheckout}
                    className="btn-primary w-full py-4 text-base group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
