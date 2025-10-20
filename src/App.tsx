import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import POSPage from "./pages/POSPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import RouteChangeLogger from "./components/common/RouteChangeLogger";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <ErrorBoundary>
              <RouteChangeLogger />
              <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Routes>
                  {/* Public Route */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Routes - Catch all except /login */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <>
                          <Header />
                          <main className="flex-1">
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/pos" element={<POSPage />} />
                              <Route
                                path="/history"
                                element={<HistoryPage />}
                              />
                              <Route
                                path="/settings"
                                element={<SettingsPage />}
                              />
                              <Route path="/404" element={<NotFoundPage />} />
                              <Route
                                path="*"
                                element={<Navigate to="/404" replace />}
                              />
                            </Routes>
                          </main>
                          <Footer />
                        </>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </ErrorBoundary>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
