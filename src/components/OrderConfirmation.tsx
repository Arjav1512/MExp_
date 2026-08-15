import { motion } from 'framer-motion';
import { Check, Package, Mail, ArrowRight } from 'lucide-react';
import type { PlacedOrder } from '../lib/commerce';
import { formatINR } from '../lib/format';
import type { Page } from '../lib/router';

interface OrderConfirmationProps {
  order: PlacedOrder;
  email: string;
  navigate: (page: Page) => void;
}

export function OrderConfirmation({ order, email, navigate }: OrderConfirmationProps) {
  const paid = order.payment_status === 'paid';
  const totalLabel = paid ? 'Total paid' : 'Total due on delivery';
  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <motion.div
        className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 16 }}
        >
          <Check className="w-10 h-10 text-on-primary" strokeWidth={3} />
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-3"
      >
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }} className="font-headline font-black text-primary leading-tight">
          Order confirmed!
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          Thank you for snacking with us. Your fresh makhana is being packed with care.
        </p>
      </motion.div>

      <motion.div
        className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 mt-8 text-left space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <span className="text-sm text-on-surface-variant">Order number</span>
          <span className="font-headline font-black text-primary tracking-wide">{order.order_number}</span>
        </div>
        {order.items.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-surface-container-high">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm gap-2">
                <span className="text-on-surface-variant">{item.product_name} × {item.quantity}</span>
                <span className="font-semibold text-on-surface tabular-nums shrink-0">{formatINR(item.line_total_cents)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="font-semibold text-on-surface tabular-nums">{formatINR(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Shipping</span>
            <span className="font-semibold text-on-surface tabular-nums">{order.shipping_cents === 0 ? 'Free' : formatINR(order.shipping_cents)}</span>
          </div>
          <div className="flex justify-between text-base pt-2.5 border-t border-surface-container-high">
            <span className="font-bold text-on-surface">{totalLabel}</span>
            <span className="font-headline font-black text-primary tabular-nums">{formatINR(order.total_cents)}</span>
          </div>
          {!paid && (
            <p className="text-xs text-on-surface-variant pt-1">Pay in cash when your order is delivered. Nothing has been charged.</p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        <div className="flex items-start gap-3 bg-surface-container rounded-xl p-4">
          <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-on-surface text-sm">Delivery</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">Arrives in 3–5 business days, sealed fresh.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-surface-container rounded-xl p-4">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-on-surface text-sm">Confirmation</p>
            <p className="text-xs text-on-surface-variant leading-relaxed break-words">A receipt is on its way to {email}.</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        onClick={() => navigate('home')}
        className="btn-primary mt-8 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        Continue snacking
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </motion.button>
    </div>
  );
}
