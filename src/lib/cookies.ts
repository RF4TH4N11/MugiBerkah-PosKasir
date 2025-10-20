/**
 * Cookie utility functions
 */

interface CookieOptions {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

const COOKIE_CONFIG: CookieOptions = {
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 hari dalam detik
};

/**
 * Set cookie
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  const config = { ...COOKIE_CONFIG, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (config.maxAge) {
    cookieString += `; Max-Age=${config.maxAge}`;
  }
  if (config.path) {
    cookieString += `; Path=${config.path}`;
  }
  if (config.domain) {
    cookieString += `; Domain=${config.domain}`;
  }
  if (config.secure) {
    cookieString += "; Secure";
  }
  if (config.sameSite) {
    cookieString += `; SameSite=${config.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Get cookie value
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete cookie
 */
export const deleteCookie = (name: string) => {
  setCookie(name, "", { maxAge: -1 });
};

/**
 * Get all cookies as object
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  document.cookie.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });
  return cookies;
};
