import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { http } from "../lib/http";
import { setCookie, getCookie, deleteCookie } from "../lib/cookies";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const COOKIE_TOKEN_KEY = "auth_token";
const COOKIE_USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Check auth saat app mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = getCookie(COOKIE_TOKEN_KEY);
      const savedUser = getCookie(COOKIE_USER_KEY);

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Set token ke header untuk request selanjutnya
          http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (err: any) {
          deleteCookie(COOKIE_TOKEN_KEY);
          deleteCookie(COOKIE_USER_KEY);
          setUser(null);
        }
      }
    };

    checkExistingAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(undefined);

      const { data } = await http.post("/auth/login", { email, password });

      if (!data.success) {
        throw new Error(data.error || "Login gagal");
      }

      const { token, user: userData } = data.data;

      // Save ke cookies (7 hari)
      setCookie(COOKIE_TOKEN_KEY, token, {
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "Lax",
      });
      setCookie(COOKIE_USER_KEY, JSON.stringify(userData), {
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "Lax",
      });

      // Set header untuk request selanjutnya
      http.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Terjadi kesalahan saat login";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    deleteCookie(COOKIE_TOKEN_KEY);
    deleteCookie(COOKIE_USER_KEY);
    delete http.defaults.headers.common["Authorization"];
    setUser(null);
    setError(undefined);
  };

  const checkAuth = useCallback(async () => {
    const token = getCookie(COOKIE_TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      // Bisa validate token ke backend jika perlu
      const savedUser = getCookie(COOKIE_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err: any) {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthCtx = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
