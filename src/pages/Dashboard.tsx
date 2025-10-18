import React, { useEffect, useState } from "react";
import { BarChart, PieChart, ArrowUp, Wallet, ShoppingBag } from "lucide-react";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../utils/formatter";

const Dashboard: React.FC = () => {
  const { products } = useProducts();
  const { transactions } = useCart();
  const [totalSales, setTotalSales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: number;
  }>({});
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Process dashboard data
  useEffect(() => {
    // Calculate total sales and transactions
    let total = 0;
    transactions.forEach((t) => (total += t.total));
    setTotalSales(total);
    setTotalTransactions(transactions.length);

    // Calculate today's sales and transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= today;
    });

    let todayTotal = 0;
    todayData.forEach((t) => (todayTotal += t.total));
    setTodaySales(todayTotal);
    setTodayTransactions(todayData.length);

    // Calculate products by category
    const categoryCount: { [key: string]: number } = {};
    products.forEach((p) => {
      if (categoryCount[p.category]) {
        categoryCount[p.category]++;
      } else {
        categoryCount[p.category] = 1;
      }
    });
    setProductsByCategory(categoryCount);

    // Recent transactions
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentTransactions(recent);
  }, [products, transactions]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Total Penjualan
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {formatCurrency(totalSales)}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
              <BarChart size={20} className="sm:size-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Penjualan Hari Ini
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {formatCurrency(todaySales)}
              </p>
              {todaySales > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1 truncate">
                  <ArrowUp size={10} className="mr-0.5 flex-shrink-0" />
                  {((todaySales / (totalSales || 1)) * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 flex-shrink-0">
              <Wallet size={20} className="sm:size-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Total Transaksi
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalTransactions}
              </p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 flex-shrink-0">
              <ShoppingBag size={20} className="sm:size-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Transaksi Hari Ini
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayTransactions}
              </p>
              {todayTransactions > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1 truncate">
                  <ArrowUp size={10} className="mr-0.5 flex-shrink-0" />
                  {(
                    (todayTransactions / (totalTransactions || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              )}
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-300 flex-shrink-0">
              <PieChart size={20} className="sm:size-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Category and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Produk by Kategori
          </h2>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(productsByCategory).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(count / products.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="whitespace-nowrap text-xs sm:text-sm">
                    ({count})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
              Tidak ada data
            </p>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            Transaksi Terbaru
          </h2>

          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      ID
                    </th>
                    <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Tanggal
                    </th>
                    <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Item
                    </th>
                    <th className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs sm:text-sm truncate">
                        {formatReceiptNumber(transaction.id)}
                      </td>
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs sm:text-sm truncate">
                        {new Date(transaction.date).toLocaleDateString(
                          "id-ID",
                          { month: "short", day: "numeric" }
                        )}
                      </td>
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-xs sm:text-sm">
                        {transaction.items.length}
                      </td>
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-3 text-right text-xs sm:text-sm font-medium">
                        {formatCurrency(transaction.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
              Belum ada transaksi
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Helper function for formatting receipt number
// This should be in formatter.ts, but added here for completeness
function formatReceiptNumber(id: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `INV/${year}${month}${day}/${id.substring(0, 4).toUpperCase()}`;
}
