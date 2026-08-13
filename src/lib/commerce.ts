import { supabase } from './supabase';

export interface NutritionRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_cents: number;
  currency: string;
  weight_grams: number;
  image_url: string;
  gallery: string[];
  benefits: string[];
  ingredients: string[];
  nutrition: NutritionRow[];
  is_active: boolean;
  stock: number;
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 49900;
export const FLAT_SHIPPING_CENTS = 4900;

export function shippingFor(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

export async function fetchFeaturedProduct(): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return normalize(data);
}

function normalize(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline ?? ''),
    description: String(row.description ?? ''),
    price_cents: Number(row.price_cents ?? 0),
    currency: String(row.currency ?? 'INR'),
    weight_grams: Number(row.weight_grams ?? 0),
    image_url: String(row.image_url ?? ''),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
    ingredients: Array.isArray(row.ingredients) ? (row.ingredients as string[]) : [],
    nutrition: Array.isArray(row.nutrition) ? (row.nutrition as NutritionRow[]) : [],
    is_active: Boolean(row.is_active),
    stock: Number(row.stock ?? 0),
  };
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderAddress {
  addressLine: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlacedOrder {
  order_number: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
}

export async function placeOrder(input: {
  customer: OrderCustomer;
  address: OrderAddress;
  items: { product_id: string; quantity: number }[];
}): Promise<PlacedOrder> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body || typeof body.order_number !== 'string') {
    const message = body && typeof body.error === 'string'
      ? body.error
      : 'We could not place your order. Please try again.';
    throw new Error(message);
  }

  return body as PlacedOrder;
}
