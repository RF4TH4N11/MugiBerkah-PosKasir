export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  unitType?: "unit" | "kg";
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  unitType?: "unit" | "kg";
  weight?: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  paymentMethod: string;
  cashReceived: number;
  change: number;
}
