import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `initializing` is separate from a normal loading flag: it's true only
  // during the first token-validation on page load. Route guards must wait
  // for it, otherwise a refresh would briefly bounce a logged-in user to
  // /login before their token has been checked.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = authService.getStoredToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    // Validate the stored token against the server rather than trusting it.
    // A token can be expired or signed with a rotated secret, and only the
    // backend can tell us that.
    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        authService.clearToken();
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const handleAuthSuccess = useCallback((data) => {
    authService.storeToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (credentials) => handleAuthSuccess(await authService.login(credentials)),
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (details) => handleAuthSuccess(await authService.register(details)),
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    authService.clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    initializing,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
