export type PaymentMethod = 'card' | 'upi' | 'cod';

export interface PaymentRequest {
  amountCents: number;
  currency: string;
  method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  provider: string;
  reference: string | null;
  error?: string;
}

/**
 * Payment abstraction. The real provider (Razorpay / Stripe / etc.) will be
 * wired in behind this single function, so the checkout UI never changes.
 * For now it simulates an authorization so the full flow is exercisable.
 */
export async function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  await new Promise((r) => setTimeout(r, 1400));

  if (req.method === 'cod') {
    return { success: true, provider: 'cash-on-delivery', reference: null };
  }

  return {
    success: true,
    provider: 'placeholder',
    reference: 'SIM-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
  };
}
