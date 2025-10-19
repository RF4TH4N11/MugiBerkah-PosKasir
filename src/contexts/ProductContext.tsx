import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { http } from "../lib/http";
import { Product } from "../types";

interface ProductContextProps {
  products: Product[];
  categories: string[];
  loading: boolean;
  error?: string;

  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextProps | undefined>(
  undefined
);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchAll = async () => {
    setError(undefined);
    const { data } = await http.get("/products");
    const rows = (data.data as any[]).map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
      unitType: p.unitType || "unit",
    })) as Product[];
    setProducts(rows);
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        await fetchAll();
      } catch (e: any) {
        if (!ignore)
          setError(e?.response?.data?.error || "Gagal memuat produk");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const addProduct = async (product: Omit<Product, "id">) => {
    const { data } = await http.post("/products", product);
    const p = data.data;
    setProducts((prev) => [
      ...prev,
      {
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        stock: p.stock,
        unitType: p.unitType || "unit",
      },
    ]);
  };

  const updateProduct = async (product: Product) => {
    const payload = {
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
      unitType: product.unitType || "unit",
    };
    const { data } = await http.put(`/products/${product.id}`, payload);
    const p = data.data;
    setProducts((prev) =>
      prev.map((x) =>
        x.id === product.id
          ? {
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.image,
              category: p.category,
              stock: p.stock,
              unitType: p.unitType || "unit",
            }
          : x
      )
    );
  };

  const deleteProduct = async (id: string) => {
    await http.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const refetchProducts = async () => {
    await fetchAll();
  };

  const value: ProductContextProps = {
    products,
    categories,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx)
    throw new Error("useProducts must be used within a ProductProvider");
  return ctx;
};
