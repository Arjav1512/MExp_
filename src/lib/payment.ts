export type PaymentMethod = 'card' | 'upi' | 'cod';

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  desc: string;
  available: boolean;
}

/**
 * Only Cash on Delivery is genuinely wired up: no card/UPI gateway is
 * configured for this project, so those methods are shown as coming soon and
 * cannot be selected. The server independently rejects any non-COD method, so
 * the UI can never place an order it can't actually fulfil.
 */
export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives', available: true },
  { id: 'upi', label: 'UPI', desc: 'Coming soon', available: false },
  { id: 'card', label: 'Card', desc: 'Coming soon', available: false },
];
