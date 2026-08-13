import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { Product } from './commerce';

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  tagline: string;
  price_cents: number;
  image_url: string;
  weight_grams: number;
  quantity: number;
}

const STORAGE_KEY = 'makhana-cart-v1';
const MAX_QTY = 50;

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.product_id === 'string' && typeof i.quantity === 'number' && i.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadItems);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write failures (e.g. private mode)
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
            : i,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          price_cents: product.price_cents,
          image_url: product.image_url,
          weight_grams: product.weight_grams,
          quantity: Math.min(MAX_QTY, Math.max(1, quantity)),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) return prev.filter((i) => i.product_id !== productId);
      return prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { count, subtotalCents } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.quantity,
        subtotalCents: acc.subtotalCents + i.price_cents * i.quantity,
      }),
      { count: 0, subtotalCents: 0 },
    );
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items, count, subtotalCents, isOpen,
      openCart, closeCart, addItem, removeItem, setQuantity, clear,
    }),
    [items, count, subtotalCents, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
