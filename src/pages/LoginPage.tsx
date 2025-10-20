import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/UI/Button";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validasi
    if (!email.trim()) {
      setLocalError("Email tidak boleh kosong");
      return;
    }
    if (!password.trim()) {
      setLocalError("Password tidak boleh kosong");
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setLocalError(err.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <LogIn size={32} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              MugiBerkah
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistem POS - Admin Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {(error || localError) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                ⚠️ {error || localError}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mugiberkah.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? "Login..." : "Login"}
            </Button>
          </form>

          {/* Footer Info */}
          {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              <strong>Demo Credentials:</strong>
              <br />
              Email: admin@mugiberkah.com
              <br />
              Password: admin123
            </p>
          </div> */}
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2025 MugiBerkah. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
