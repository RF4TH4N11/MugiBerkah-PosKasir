import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteChangeLogger() {
  const loc = useLocation();
  useEffect(() => {
    // bantu debug kalo tiba-tiba pindah route
    // eslint-disable-next-line no-console
    console.log("[route]", loc.pathname + loc.search);
  }, [loc.pathname, loc.search]);
  return null;
}
