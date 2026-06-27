"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ab_cart_v1";

function effectivePrice(item: Pick<CartItem, "price" | "salePrice">): number {
  if (item.salePrice && item.salePrice > 0 && item.salePrice < item.price) return item.salePrice;
  return item.price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* ignore */
      }
    }
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const max = item.stock > 0 ? item.stock : 99;
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + qty, max) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, max) }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock > 0 ? i.stock : 99)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + effectivePrice(i) * i.quantity, 0);
    return { items, count, subtotal, ready, open, setOpen, addItem, removeItem, setQty, clear };
  }, [items, ready, open, addItem, removeItem, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
