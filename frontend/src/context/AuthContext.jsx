import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id, email, name}
  const [loading, setLoading] = useState(true);

  // Hydrate session on refresh (cookie session or local fallback)
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (!cancel) setUser(data);
      } catch {
        const cached = localStorage.getItem("auth_user");
        if (cached && !cancel) setUser(JSON.parse(cached));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const login = async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setUser(data.user);
    localStorage.setItem("auth_user", JSON.stringify(data.user)); // remove if cookie-only
    return data.user;
  };

  const signup = async ({ name, email, password }) => {
    const { data } = await api.post("/api/auth/signup", { name, email, password });
    setUser(data.user);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/api/auth/logout", {}); } catch {}
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
