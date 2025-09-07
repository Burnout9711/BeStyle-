// src/components/PublicOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute({ children }) {
  const { user, checking } = useAuth();
  if (checking) return null; // or a spinner
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
