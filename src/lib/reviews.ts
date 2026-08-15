import { supabase } from './supabase';

export interface CustomerReview {
  id: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface SubmitReviewInput {
  customer_name: string;
  rating: number;
  title?: string;
  body: string;
  product_slug?: string;
  order_number?: string;
  access_token?: string;
}

// Only approved reviews are ever returned — the RLS policy on customer_reviews
// exposes nothing else to the anon key, so pending/rejected rows can never leak.
export async function fetchApprovedReviews(limit = 60): Promise<CustomerReview[]> {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('id, customer_name, rating, title, body, is_verified, is_featured, created_at')
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as CustomerReview[];
}

export function computeStats(reviews: CustomerReview[]): ReviewStats {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const key = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[key] += 1;
    sum += r.rating;
  }
  const count = reviews.length;
  return {
    count,
    average: count ? Math.round((sum / count) * 10) / 10 : 0,
    distribution,
  };
}

export interface SubmitReviewResult {
  ok: boolean;
  verified?: boolean;
  message: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-review`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => null);

    if (!res.ok || !body || typeof body !== 'object') {
      const message =
        body && typeof body.error === 'string'
          ? body.error
          : 'We could not submit your review. Please try again.';
      return { ok: false, message };
    }

    return {
      ok: true,
      verified: Boolean(body.verified),
      message:
        typeof body.message === 'string'
          ? body.message
          : 'Thank you! Your review will appear once approved.',
    };
  } catch {
    return { ok: false, message: 'We could not reach the server. Please check your connection and try again.' };
  }
}
