import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import SocialLogin from "@/components/SocialLogin";
// import { GoogleLogin } from "@react-oauth/google";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic client validation
    if (!form.email || form.email.length < 5) return toast.error("Enter a valid email.");
    if (!form.password || form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (!isLogin && (!form.name || form.name.length < 2)) return toast.error("Name must be at least 2 characters.");

    try {
      setSubmitting(true);
      if (isLogin) {
        // Login
        await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
        toast.success("Welcome back!");
      } else {
        // Signup
        await api.post("/api/auth/signup", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        toast.success("Account created!");
      }
      // On success we have a linked session cookie; go to profile
      navigate("/profile", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        (isLogin ? "Login failed." : "Signup failed.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  function continueWithGoogle() {
    const postLoginDest = `${window.location.origin}/profile`; // or wherever
    window.location.href = `${API_BASE}/api/auth/google/login?redirect=${encodeURIComponent(postLoginDest)}`;
  }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setSubmitting(true);
      // await api.post("/api/auth/login/google", {
      //   token: credentialResponse.credential,
      // });
      console.log(credentialResponse);
      console.log(credentialResponse.credential);
      toast.success("Logged in with Google!");

      navigate("/profile", { replace: true });

    } catch (err) {

      const msg =
        err?.response?.data?.detail || err?.message || "Google login failed.";
      toast.error(msg);

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Header */}
      {/* <header className="header-nav">
        <div className="logo">BeStyle.AI</div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            <ArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
            Back to Home
          </button>
        </div>
      </header> */}
      <Header></Header>

      {/* Auth Card */}
      <div style={{ paddingTop: "100px", paddingBottom: "2rem" }}>
        <div
          className="quiz-card"
          style={{
            maxWidth: 400,
            margin: "3rem auto",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            padding: "2rem",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#3b3b3b" }}>
            {isLogin ? "Login to BeStyle.AI" : "Sign Up for BeStyle.AI"}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="name" style={{ fontWeight: 500, color: "#3b3b3b" }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: "1px solid #3b3b3b",
                    marginTop: "0.5rem",
                    color: "#222",
                  }}
                />
              </div>
            )}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label htmlFor="email" style={{ fontWeight: 500, color: "#3b3b3b" }}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #3b3b3b",
                  marginTop: "0.5rem",
                  color: "#222",
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1.5rem", position: "relative" }}>
              <label htmlFor="password" style={{ fontWeight: 500, color: "#3b3b3b" }}>
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 8,
                  border: "1px solid #3b3b3b",
                  marginTop: "0.5rem",
                  color: "#222",
                  paddingRight: "2.5rem",
                }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "2.5rem",
                  cursor: "pointer",
                  color: "#888",
                }}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: 8,
                background: submitting ? "#6b6b6b" : "#3b3b3b",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                marginBottom: "1rem",
                transition: "opacity .2s",
                opacity: submitting ? 0.8 : 1,
              }}
            >
              {isLogin ? (submitting ? "Logging in…" : "Login") : submitting ? "Creating…" : "Sign Up"}
            </button>
          </form>

          {/* Social buttons (placeholders) */}
          <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
            <span style={{ color: "#888", fontWeight: 500 }}>Or continue with</span>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
              {/* <SocialLogin provider="google" /> */}
              <button onClick={continueWithGoogle}>Continue with Google</button>
              {/* <GoogleLogin onSuccess={handleGoogleLoginSuccess} onFailure={() => { console.log("Google login failed"); }} /> */}
            </div>
          </div>

          {/* Toggle link */}
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#888" }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              className="btn-link"
              style={{
                background: "none",
                border: "none",
                color: "#3b3b3b",
                fontWeight: 500,
                marginLeft: "0.5rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
