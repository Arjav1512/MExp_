import { supabase } from './supabase';

export interface NutritionRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  generic_name: string;
  flavour: string;
  dietary: string;
  tagline: string;
  description: string;
  price_cents: number;
  mrp_cents: number;
  currency: string;
  weight_grams: number;
  pack_size: string;
  package_weight_grams: number;
  dimensions: string;
  origin: string;
  manufacturer: string;
  packer: string;
  packer_contact: string;
  shelf_life: string;
  storage: string;
  nutrition_basis: string;
  image_url: string;
  gallery: string[];
  benefits: string[];
  claims: string[];
  how_to_use: string[];
  ingredients: string[];
  nutrition: NutritionRow[];
  is_active: boolean;
  stock: number;
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 49900;
export const FLAT_SHIPPING_CENTS = 4900;

export function unitPricePer100gCents(priceCents: number, weightGrams: number): number {
  if (weightGrams <= 0) return 0;
  return Math.round((priceCents / weightGrams) * 100);
}

export function savingsPercent(mrpCents: number, priceCents: number): number {
  if (mrpCents <= 0 || priceCents >= mrpCents) return 0;
  return Math.round(((mrpCents - priceCents) / mrpCents) * 100);
}

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
    brand: String(row.brand ?? ''),
    generic_name: String(row.generic_name ?? ''),
    flavour: String(row.flavour ?? ''),
    dietary: String(row.dietary ?? ''),
    tagline: String(row.tagline ?? ''),
    description: String(row.description ?? ''),
    price_cents: Number(row.price_cents ?? 0),
    mrp_cents: Number(row.mrp_cents ?? 0),
    currency: String(row.currency ?? 'INR'),
    weight_grams: Number(row.weight_grams ?? 0),
    pack_size: String(row.pack_size ?? ''),
    package_weight_grams: Number(row.package_weight_grams ?? 0),
    dimensions: String(row.dimensions ?? ''),
    origin: String(row.origin ?? ''),
    manufacturer: String(row.manufacturer ?? ''),
    packer: String(row.packer ?? ''),
    packer_contact: String(row.packer_contact ?? ''),
    shelf_life: String(row.shelf_life ?? ''),
    storage: String(row.storage ?? ''),
    nutrition_basis: String(row.nutrition_basis ?? ''),
    image_url: String(row.image_url ?? ''),
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
    claims: Array.isArray(row.claims) ? (row.claims as string[]) : [],
    how_to_use: Array.isArray(row.how_to_use) ? (row.how_to_use as string[]) : [],
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

export interface PlacedOrderItem {
  product_name: string;
  quantity: number;
  line_total_cents: number;
}

export interface PlacedOrder {
  order_number: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_method: string;
  access_token: string;
  items: PlacedOrderItem[];
}

export async function placeOrder(input: {
  idempotency_key: string;
  payment_method: string;
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

export async function fetchOrder(orderNumber: string, accessToken: string): Promise<PlacedOrder | null> {
  const { data, error } = await supabase.rpc('get_order', {
    p_order_number: orderNumber,
    p_access_token: accessToken,
  });
  if (error || !data || typeof (data as PlacedOrder).order_number !== 'string') return null;
  return data as PlacedOrder;
}
