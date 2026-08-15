/**
 * Real-user end-to-end ordering test.
 *
 * This drives ONLY the public storefront surface — the exact endpoints the
 * browser uses: the anon-key REST read for the product, the `create-order`
 * edge function, and the `get_order` RPC. It never uses the service-role key
 * and never touches the database directly, so a pass proves a brand-new
 * visitor can complete a real order.
 */
import { readFileSync } from 'node:fs';

function loadEnv() {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const BASE = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
if (!BASE || !ANON) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  process.exit(2);
}

const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' };
const results = [];
let failures = 0;

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  if (!ok) failures++;
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function restReadProduct() {
  const url = `${BASE}/rest/v1/products?is_active=eq.true&select=id,slug,name,price_cents,mrp_cents,weight_grams,pack_size,flavour,origin,manufacturer,packer,ingredients,nutrition,stock&order=sort_order.asc&limit=1`;
  const res = await fetch(url, { headers: anonHeaders });
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function readStock(id) {
  const url = `${BASE}/rest/v1/products?id=eq.${id}&select=stock`;
  const res = await fetch(url, { headers: anonHeaders });
  const rows = await res.json();
  return rows?.[0]?.stock ?? null;
}

async function placeOrder(body) {
  const res = await fetch(`${BASE}/functions/v1/create-order`, {
    method: 'POST',
    headers: anonHeaders,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function getOrder(orderNumber, token) {
  const res = await fetch(`${BASE}/rest/v1/rpc/get_order`, {
    method: 'POST',
    headers: anonHeaders,
    body: JSON.stringify({ p_order_number: orderNumber, p_access_token: token }),
  });
  return res.json().catch(() => null);
}

const baseCustomer = { name: 'Aarav Mehta', email: 'aarav.e2e@example.com', phone: '9876543210' };
const baseAddress = { addressLine: 'Flat 7C, Lotus Towers', street: 'FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411004' };
const FREE_SHIPPING_THRESHOLD = 49900;
const FLAT_SHIPPING = 4900;

function expectedTotals(price, qty) {
  const subtotal = price * qty;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  return { subtotal, shipping, total: subtotal + shipping };
}

async function main() {
  console.log('\n=== Makhana Express — Real-User E2E Ordering Test ===\n');

  // 1. Storefront can read the product (anon key)
  const product = await restReadProduct();
  check('Storefront loads an active product', product && product.id, product ? product.slug : 'no product');
  if (!product) { finish(); return; }

  const startStock = await readStock(product.id);
  check('Product stock is readable and positive', typeof startStock === 'number' && startStock > 0, `stock=${startStock}`);

  // 1b. Product data matches the real Amazon listing (ASIN B0H6C1FYSR)
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients.join(' ').toLowerCase() : '';
  const nutritionLabels = Array.isArray(product.nutrition) ? product.nutrition.map((n) => String(n.label).toLowerCase()) : [];
  check('Product name is "Plain Phool Makhana"', /plain phool makhana/i.test(product.name || ''), product.name);
  check('Slug reflects the plain product', product.slug === 'plain-phool-makhana', product.slug);
  check('Net weight is 250 g', product.weight_grams === 250, `${product.weight_grams} g`);
  check('Pack size stated as pack of 1', /250\s*g/i.test(product.pack_size || '') && /pack of 1/i.test(product.pack_size || ''), product.pack_size);
  check('Flavour is plain / unflavoured', /unflavou?red|plain/i.test(product.flavour || ''), product.flavour);
  check('Selling price is Rs 390', product.price_cents === 39000, `price_cents=${product.price_cents}`);
  check('MRP is Rs 499 and above selling price', product.mrp_cents === 49900 && product.mrp_cents > product.price_cents, `mrp_cents=${product.mrp_cents}`);
  check('Single ingredient is makhana / fox nuts', /makhana|fox\s*nut/i.test(ingredients), ingredients || 'none');
  check('Nutrition facts present (per 100 g basis)', nutritionLabels.some((l) => /protein/.test(l)) && nutritionLabels.some((l) => /energy|calorie/.test(l)), `${nutritionLabels.length} rows`);
  check('Country of origin is India', /india/i.test(product.origin || ''), product.origin);
  check('Manufacturer is recorded', Boolean(product.manufacturer), product.manufacturer || 'missing');
  check('Packer is recorded', Boolean(product.packer), product.packer || 'missing');

  // 2. Place a genuine COD order (qty 1)
  const qty = 1;
  const exp = expectedTotals(product.price_cents, qty);
  const key1 = crypto.randomUUID();
  const order1 = await placeOrder({
    idempotency_key: key1, payment_method: 'cod',
    customer: baseCustomer, address: baseAddress,
    items: [{ product_id: product.id, quantity: qty }],
  });
  const o1 = order1.json;
  check('New user can place a COD order', order1.status === 200 && o1?.order_number, o1?.order_number || o1?.error);
  check('Server is authoritative for pricing', o1 && o1.subtotal_cents === exp.subtotal && o1.shipping_cents === exp.shipping && o1.total_cents === exp.total,
    o1 ? `got total ${o1.total_cents}, expected ${exp.total}` : 'no order');
  check('COD order is unpaid (due on delivery)', o1?.payment_status === 'unpaid' && o1?.payment_method === 'cod', o1?.payment_status);
  check('Order returns an access token + items', o1?.access_token && Array.isArray(o1?.items) && o1.items.length === qty, `${o1?.items?.length} item(s)`);

  const afterOne = await readStock(product.id);
  check('Inventory decremented by exactly the quantity ordered', afterOne === startStock - qty, `${startStock} -> ${afterOne}`);

  // 3. Idempotency — same key returns the same order, no extra stock movement
  const replay = await placeOrder({
    idempotency_key: key1, payment_method: 'cod',
    customer: baseCustomer, address: baseAddress,
    items: [{ product_id: product.id, quantity: qty }],
  });
  check('Duplicate submit (same key) returns the same order', replay.json?.order_number === o1?.order_number, `${replay.json?.order_number} vs ${o1?.order_number}`);
  const afterReplay = await readStock(product.id);
  check('Duplicate submit does NOT decrement stock again', afterReplay === afterOne, `stock=${afterReplay}`);

  // 4. Secure retrieval
  const good = await getOrder(o1.order_number, o1.access_token);
  check('Order retrievable with the correct token', good?.order_number === o1.order_number);
  const badToken = await getOrder(o1.order_number, 'not-the-real-token');
  check('Order NOT retrievable with a wrong token', badToken === null);
  const enumerate = await getOrder(o1.order_number, '');
  check('Order NOT retrievable without a token (no enumeration)', enumerate === null);

  // 5. Oversell guard — request MORE than the current remaining stock.
  // The edge caps a single line at 50 units, so build enough 50-unit lines to
  // guarantee the total exceeds stock; the server must reject the whole thing.
  const stockNow = await readStock(product.id);
  const lineCount = Math.floor(stockNow / 50) + 1;
  const oversellItems = Array.from({ length: lineCount }, () => ({ product_id: product.id, quantity: 50 }));
  const oversell = await placeOrder({
    idempotency_key: crypto.randomUUID(), payment_method: 'cod',
    customer: baseCustomer, address: baseAddress,
    items: oversellItems,
  });
  check('Oversell is rejected (cannot exceed stock)',
    oversell.status >= 400 && oversell.json?.code === 'INSUFFICIENT_STOCK',
    oversell.json?.code || oversell.json?.error || `status ${oversell.status}`);
  const afterOversell = await readStock(product.id);
  check('Rejected oversell leaves inventory unchanged (no partial decrement)', afterOversell === stockNow, `${stockNow} -> ${afterOversell}`);

  // 6. Payment reality — card/upi are not wired, server must refuse
  const card = await placeOrder({
    idempotency_key: crypto.randomUUID(), payment_method: 'card',
    customer: baseCustomer, address: baseAddress,
    items: [{ product_id: product.id, quantity: 1 }],
  });
  check('Unconfigured card payment is refused (no fake charge)', card.status >= 400 && (card.json?.code === 'PAYMENT_METHOD_UNAVAILABLE' || /payment method/i.test(card.json?.error || '')), card.json?.code || card.json?.error);

  // 7. Input validation
  const badPin = await placeOrder({
    idempotency_key: crypto.randomUUID(), payment_method: 'cod',
    customer: baseCustomer, address: { ...baseAddress, pincode: '123' },
    items: [{ product_id: product.id, quantity: 1 }],
  });
  check('Invalid pincode is rejected', badPin.status === 400, `status ${badPin.status}`);
  const badEmail = await placeOrder({
    idempotency_key: crypto.randomUUID(), payment_method: 'cod',
    customer: { ...baseCustomer, email: 'not-an-email' }, address: baseAddress,
    items: [{ product_id: product.id, quantity: 1 }],
  });
  check('Invalid email is rejected', badEmail.status === 400, `status ${badEmail.status}`);

  // 8. Orders are NOT publicly readable (no RLS policy => anon sees nothing)
  const leak = await fetch(`${BASE}/rest/v1/orders?select=*`, { headers: anonHeaders });
  const leakBody = await leak.json().catch(() => null);
  check('Orders table is not publicly readable', Array.isArray(leakBody) && leakBody.length === 0, `rows=${Array.isArray(leakBody) ? leakBody.length : 'n/a'}`);

  finish();
}

function finish() {
  console.log(`\n=== ${results.length - failures}/${results.length} checks passed ===\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('E2E harness crashed:', e); process.exit(2); });
