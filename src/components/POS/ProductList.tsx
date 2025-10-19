import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useProducts } from "../../contexts/ProductContext";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/formatter";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

const ProductList: React.FC = () => {
  const { products, categories } = useProducts();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] =
    useState<any>(null);
  const [weight, setWeight] = useState<string>("1");

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product: any) => {
    // Jika produk kg, buka modal untuk input weight
    if (product.unitType === "kg") {
      setSelectedProductForWeight(product);
      setWeight("1");
      setWeightModalOpen(true);
      return;
    }

    // Untuk produk unit, langsung add ke cart
    const subtotal = product.price * 1;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      subtotal,
      unitType: "unit",
    });
  };

  const handleAddWeightProduct = () => {
    if (!selectedProductForWeight) return;

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue < 0.1) {
      alert("Berat minimal 0.1 kg");
      return;
    }

    const subtotal = selectedProductForWeight.price * weightValue;
    addToCart({
      productId: selectedProductForWeight.id,
      name: selectedProductForWeight.name,
      price: selectedProductForWeight.price,
      quantity: weightValue,
      weight: weightValue,
      subtotal,
      unitType: "kg",
    });

    setWeightModalOpen(false);
    setSelectedProductForWeight(null);
    setWeight("1");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-sm mb-3 sm:mb-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 px-2">
            <p className="text-sm sm:text-base">
              Tidak ada produk yang ditemukan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-95"
                onClick={() => handleAddToCart(product)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.unitType === "kg" && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold">
                      /kg
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-1.5 sm:p-2">
                    <div className="font-medium truncate text-xs sm:text-sm">
                      {product.name}
                    </div>
                    <div className="text-xs sm:text-sm">
                      {formatCurrency(product.price)}
                      {product.unitType === "kg" && "/kg"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weight Input Modal untuk produk kg */}
      <Modal
        isOpen={weightModalOpen}
        onClose={() => {
          setWeightModalOpen(false);
          setSelectedProductForWeight(null);
        }}
        title="Masukkan Berat"
      >
        {selectedProductForWeight && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                {selectedProductForWeight.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Harga: {formatCurrency(selectedProductForWeight.price)}/kg
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Berat (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Masukkan berat dalam kg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {weight && parseFloat(weight) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <p className="text-sm">
                  Total:{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(
                      selectedProductForWeight.price * parseFloat(weight)
                    )}
                  </span>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setWeightModalOpen(false);
                  setSelectedProductForWeight(null);
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleAddWeightProduct}
                className="flex-1"
              >
                Tambah ke Keranjang
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
