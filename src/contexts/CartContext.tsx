import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { http } from "../lib/http";
import { CartItem, Transaction } from "../types";

/** Payload khusus untuk membuat transaksi ke backend */
export type CreateTransactionPayload = {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unitType?: "unit" | "kg"; // Tipe unit penjualan
    weight?: number; // Untuk produk dengan unitType="kg"
    subtotal?: number; // FE boleh kirim; BE juga re-calc
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "qris" | "card";
  cashReceived: number;
  change: number;
  customerName?: string;
  note?: string;
  date?: string; // opsional; BE auto-set
};

interface CartCtx {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  discount: number;
  setDiscount: (n: number) => void;

  calculateTotal: () => { subtotal: number; total: number };

  addTransaction: (payload: CreateTransactionPayload) => Promise<void>;
  transactions: Transaction[];
  loading: boolean;
  error?: string;
}

const CartContext = createContext<CartCtx | undefined>(undefined);

// Helper normalisasi agar UI selalu dapat field yang valid
const normalizeTx = (t: any): Transaction => {
  const pm = typeof t?.paymentMethod === "string" ? t.paymentMethod : "cash";
  const dateStr = t?.date
    ? new Date(t.date).toISOString()
    : new Date().toISOString();
  const safeNumber = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  // id fallback supaya React key selalu ada
  const id =
    t?._id ||
    t?.id ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : String(Math.random()));

  return {
    id,
    items: Array.isArray(t?.items) ? t.items : [],
    subtotal: safeNumber(t?.subtotal),
    discount: safeNumber(t?.discount),
    total: safeNumber(t?.total),
    date: dateStr,
    paymentMethod: pm,
    cashReceived: safeNumber(t?.cashReceived),
    change: safeNumber(t?.change),
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Load history awal (pakai AbortController biar gak setState setelah unmount)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { data } = await http.get("/transactions?sort=date:desc", {
          signal: ac.signal as any,
        });
        const rows = ((data?.data as any[]) ?? []).map(normalizeTx);
        setTransactions(rows);
      } catch (e: any) {
        // Abaikan jika dibatalkan
        if (e?.name !== "CanceledError" && e?.message !== "canceled") {
          // Optional: console.warn("[history] load failed:", e?.message || e);
        }
      }
    })();
    return () => ac.abort();
  }, []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exist = prev.find((x) => x.productId === item.productId);
      if (exist) {
        // Untuk produk kg, gunakan weight; untuk unit, gunakan quantity
        const quantity = exist.quantity + item.quantity;
        const weight = (exist.weight || 0) + (item.weight || 0);

        // Hitung subtotal berdasarkan unitType
        let subtotal = 0;
        if (item.unitType === "kg") {
          subtotal = exist.price * weight;
        } else {
          subtotal = exist.price * quantity;
        }

        return prev.map((x) =>
          x.productId === item.productId
            ? {
                ...x,
                quantity,
                weight: item.unitType === "kg" ? weight : quantity,
                subtotal,
              }
            : x
        );
      }

      // Calculate subtotal untuk item baru
      let subtotal = 0;
      if (item.unitType === "kg") {
        subtotal = item.price * (item.weight || item.quantity);
      } else {
        subtotal = item.price * item.quantity;
      }

      return [...prev, { ...item, subtotal }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((x) => {
        if (x.productId === productId) {
          // Validasi minimum
          const minValue = x.unitType === "kg" ? 0.1 : 1;
          if (quantity < minValue) return x; // Skip jika dibawah minimum

          // Hitung subtotal
          let subtotal = 0;
          if (x.unitType === "kg") {
            subtotal = x.price * quantity;
          } else {
            subtotal = x.price * quantity;
          }

          return {
            ...x,
            quantity,
            weight: x.unitType === "kg" ? quantity : undefined,
            subtotal,
          };
        }
        return x;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const calculateTotal = useMemo(
    () => () => {
      const subtotal = cart.reduce((s, it) => {
        // Untuk kg: price * weight; untuk unit: price * quantity
        if (it.unitType === "kg") {
          return s + it.price * (it.weight || it.quantity);
        }
        return s + it.price * it.quantity;
      }, 0);
      const total = Math.max(0, subtotal - (discount || 0));
      return { subtotal, total };
    },
    [cart, discount]
  );

  const addTransaction = async (tx: CreateTransactionPayload) => {
    try {
      setLoading(true);
      setError(undefined);

      const { data } = await http.post("/transactions", tx);
      const normalized = normalizeTx(data?.data);

      setTransactions((prev) => [normalized, ...prev]);
      clearCart();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Gagal menyelesaikan transaksi");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: CartCtx = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    discount,
    setDiscount,
    calculateTotal,
    addTransaction,
    transactions,
    loading,
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
