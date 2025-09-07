import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (mounted) setUser(data);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const signup = async ({ name, email, password }) => {
    const { data } = await api.post("/api/auth/signup", { name, email, password });
    setUser(data);
    return data;
  };

  const login = async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    // Optionally hit /api/auth/me to create a fresh anon session cookie
    try { await api.get("/api/auth/me"); } catch {}
  };

  return (
    <AuthCtx.Provider value={{ user, checking, signup, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
