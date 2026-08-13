import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, User, MapPin, ClipboardList, CreditCard, Loader2, Lock, ShoppingBag, AlertCircle, Truck } from 'lucide-react';
import type { Page } from '../lib/router';
import { useCart } from '../lib/cart';
import { formatINR } from '../lib/format';
import { shippingFor, placeOrder, type PlacedOrder, type OrderCustomer, type OrderAddress } from '../lib/commerce';
import { PAYMENT_OPTIONS, type PaymentMethod } from '../lib/payment';
import { isValidEmail } from '../lib/emailValidation';
import { OrderConfirmation } from './OrderConfirmation';
import { trackCTAClick } from '../lib/analytics';

interface CheckoutWizardProps {
  navigate: (page: Page) => void;
}

const STEPS = [
  { id: 1, label: 'Details', icon: User },
  { id: 2, label: 'Address', icon: MapPin },
  { id: 3, label: 'Review', icon: ClipboardList },
  { id: 4, label: 'Payment', icon: CreditCard },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

type Errors = Record<string, string>;

export function CheckoutWizard({ navigate }: CheckoutWizardProps) {
  const { items, subtotalCents, clear } = useCart();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<OrderCustomer>({ name: '', email: '', phone: '' });
  const [address, setAddress] = useState<OrderAddress>({ addressLine: '', street: '', city: '', state: '', pincode: '' });
  const [method, setMethod] = useState<PaymentMethod>('cod');
  const [errors, setErrors] = useState<Errors>({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const shipping = shippingFor(subtotalCents);
  const total = subtotalCents + shipping;

  if (placed) {
    return (
      <div className="pt-[68px] min-h-screen bg-background px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <OrderConfirmation order={placed} email={customer.email} navigate={navigate} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-[68px] min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-on-surface-variant" />
          </div>
          <h1 className="font-headline font-black text-2xl text-primary">Your cart is empty</h1>
          <p className="text-on-surface-variant">Add some fresh makhana before checking out.</p>
          <button className="btn-primary" onClick={() => navigate('product')}>Shop Makhana</button>
        </div>
      </div>
    );
  }

  const validateStep1 = (): boolean => {
    const e: Errors = {};
    if (customer.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!isValidEmail(customer.email.trim())) e.email = 'Please enter a valid email address.';
    if (!/^[0-9]{10}$/.test(customer.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Enter a valid 10-digit phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Errors = {};
    if (address.addressLine.trim().length < 2) e.addressLine = 'House / flat is required.';
    if (address.city.trim().length < 2) e.city = 'City is required.';
    if (!address.state) e.state = 'Please select your state.';
    if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    setSubmitError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setSubmitError('');
    if (step === 1) { navigate('product'); return; }
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (processing) return;
    setProcessing(true);
    setSubmitError('');
    trackCTAClick('Place Order', 'checkout');
    try {
      const order = await placeOrder({
        idempotency_key: idempotencyKeyRef.current,
        payment_method: method,
        customer,
        address,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      clear();
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pt-[68px] min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-10">
        <div className="mb-10">
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }} className="font-headline font-black text-primary leading-tight mb-6">
            Checkout
          </h1>
          <Stepper current={step} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          <div className="min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {step === 1 && (
                  <StepCard title="Your details" subtitle="Where we'll send your order updates.">
                    <Field label="Full name" error={errors.name}>
                      <input className="input" value={customer.name} autoComplete="name"
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Priya Sharma" />
                    </Field>
                    <Field label="Email address" error={errors.email}>
                      <input className="input" type="email" value={customer.email} autoComplete="email"
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="priya@example.com" />
                    </Field>
                    <Field label="Phone number" error={errors.phone}>
                      <input className="input" type="tel" value={customer.phone} autoComplete="tel" inputMode="numeric"
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="98765 43210" />
                    </Field>
                  </StepCard>
                )}

                {step === 2 && (
                  <StepCard title="Delivery address" subtitle="Where should we send your makhana?">
                    <Field label="House / Flat number" error={errors.addressLine}>
                      <input className="input" value={address.addressLine} autoComplete="address-line1"
                        onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} placeholder="Flat 4B, Green Residency" />
                    </Field>
                    <Field label="Street / Area" error={errors.street}>
                      <input className="input" value={address.street} autoComplete="address-line2"
                        onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="MG Road" />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="City" error={errors.city}>
                        <input className="input" value={address.city} autoComplete="address-level2"
                          onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Patna" />
                      </Field>
                      <Field label="Pincode" error={errors.pincode}>
                        <input className="input" value={address.pincode} inputMode="numeric" maxLength={6} autoComplete="postal-code"
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })} placeholder="800001" />
                      </Field>
                    </div>
                    <Field label="State" error={errors.state}>
                      <select className="input" value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                        <option value="">Select a state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </StepCard>
                )}

                {step === 3 && (
                  <StepCard title="Review your order" subtitle="Make sure everything looks right.">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product_id} className="flex gap-3 items-center bg-surface-container rounded-xl p-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-lowest shrink-0">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                            <p className="text-xs text-on-surface-variant">Qty {item.quantity} · {item.weight_grams}g</p>
                          </div>
                          <span className="font-bold text-primary tabular-nums">{formatINR(item.price_cents * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-surface-container-high space-y-1.5 text-sm">
                      <p className="font-bold text-on-surface mb-1">Shipping to</p>
                      <p className="text-on-surface-variant leading-relaxed">
                        {customer.name} · {customer.phone}<br />
                        {address.addressLine}{address.street ? `, ${address.street}` : ''}<br />
                        {address.city}, {address.state} — {address.pincode}
                      </p>
                    </div>
                  </StepCard>
                )}

                {step === 4 && (
                  <StepCard title="Payment" subtitle="Choose how you'd like to pay.">
                    <div className="space-y-3">
                      {PAYMENT_OPTIONS.map((opt) => {
                        const selected = method === opt.id;
                        return (
                          <button
                            key={opt.id}
                            disabled={!opt.available}
                            onClick={() => opt.available && setMethod(opt.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                              !opt.available ? 'border-outline/15 opacity-55 cursor-not-allowed'
                              : selected ? 'border-primary bg-primary/[0.04]' : 'border-outline/25 hover:border-outline/50'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected && opt.available ? 'border-primary' : 'border-outline/40'}`}>
                              {selected && opt.available && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </span>
                            <span className="flex-1">
                              <span className="flex items-center gap-2 font-bold text-on-surface text-sm">
                                {opt.label}
                                {!opt.available && <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant bg-surface-container-high rounded-full px-2 py-0.5">Soon</span>}
                              </span>
                              <span className="block text-xs text-on-surface-variant">{opt.desc}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2.5">
                      <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                      You'll pay in cash when your order is delivered. Nothing is charged now.
                    </div>
                    {submitError && (
                      <div className="mt-4 flex items-start gap-2 text-sm text-error bg-error-container rounded-lg px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {submitError}
                      </div>
                    )}
                  </StepCard>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <button onClick={back} disabled={processing}
                className="inline-flex items-center gap-2 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors disabled:opacity-40">
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? 'Back to product' : 'Back'}
              </button>
              {step < 4 ? (
                <motion.button onClick={next} className="btn-primary group" whileTap={{ scale: 0.97 }}>
                  Continue
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              ) : (
                <motion.button onClick={handlePlaceOrder} disabled={processing}
                  className="btn-primary min-w-[180px]" whileTap={{ scale: 0.97 }}>
                  {processing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Place order · {formatINR(total)}</>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          <aside className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 lg:sticky lg:top-[92px]">
            <h2 className="font-headline font-black text-lg text-on-surface mb-4">Order summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm gap-2">
                  <span className="text-on-surface-variant">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-on-surface tabular-nums shrink-0">{formatINR(item.price_cents * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-surface-container-high text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-semibold text-on-surface tabular-nums">{formatINR(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="font-semibold text-on-surface tabular-nums">{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between text-base pt-2.5 border-t border-surface-container-high">
                <span className="font-bold text-on-surface">Total</span>
                <span className="font-headline font-black text-primary tabular-nums">{formatINR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done ? 'bg-primary border-primary text-on-primary'
                  : active ? 'border-primary text-primary bg-primary/[0.06]'
                  : 'border-outline/30 text-on-surface-variant'
                }`}
                animate={{ scale: active ? 1.08 : 1 }}
              >
                {done ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className="w-[18px] h-[18px]" />}
              </motion.div>
              <span className={`text-[11px] font-bold uppercase tracking-wide ${active || done ? 'text-primary' : 'text-on-surface-variant'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full bg-surface-container-high overflow-hidden">
                <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-headline font-black text-xl text-on-surface">{title}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-error font-medium mt-1.5">{error}</span>}
    </label>
  );
}
