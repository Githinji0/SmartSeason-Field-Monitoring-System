import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const initialRegisterState = {
  name: "",
  email: "",
  password: ""
};

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register, isAuthenticated, isInitializing } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isInitializing) {
    return <p className="auth-loading">Loading session...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(loginForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(registerForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>{isLogin ? "Sign In" : "Create Account"}</h1>
        <p>{isLogin ? "Access your SmartSeason dashboard." : "Register to manage your field devices. New accounts start as farmer."}</p>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <input
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
              required
              minLength={8}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {error ? <p className="error">{error}</p> : null}

        <div className="auth-switch">
          {isLogin ? (
            <Link to="/register">No account? Register</Link>
          ) : (
            <Link to="/login">Already have an account? Sign in</Link>
          )}
        </div>
      </section>
    </main>
  );
}
