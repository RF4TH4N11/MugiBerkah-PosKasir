import React from "react";
import ProductList from "../components/POS/ProductList";
import Cart from "../components/POS/Cart";

const POSPage: React.FC = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6">Kasir</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)]">
        {/* Products */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 overflow-hidden">
          <ProductList />
        </div>

        {/* Cart */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 overflow-hidden">
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default POSPage;
