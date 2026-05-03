import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../api/client";

const TOKEN_STORAGE_KEY = "smartseason_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  useEffect(() => {
    async function initialize() {
      if (!token) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken("");
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, [token]);

  function applySession({ token: nextToken, user: nextUser }) {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
    try {
      window.dispatchEvent(
        new CustomEvent("smartseason:auth-changed", { detail: { user: nextUser, token: nextToken } })
      );
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  async function login({ email, password }) {
    const result = await loginUser({ email, password });
    applySession(result);
    return result.user;
  }

  async function register(payload) {
    const result = await registerUser(payload);
    applySession(result);
    return result.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setUser(null);
    try {
      window.dispatchEvent(new CustomEvent("smartseason:auth-changed", { detail: { user: null, token: null } }));
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      register,
      applySession,
      logout
    }),
    [token, user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
