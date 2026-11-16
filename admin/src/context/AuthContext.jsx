
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify an existing session with the backend.
  useEffect(() => {
    const verifySession = async () => {
      const token = sessionStorage.getItem(
        "sharkrypto_admin_token"
      );

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();

        if (!response.user) {
          throw new Error("Invalid authentication response.");
        }

        setUser(response.user);

        sessionStorage.setItem(
          "sharkrypto_admin_user",
          JSON.stringify(response.user)
        );
      } catch (error) {
        sessionStorage.removeItem("sharkrypto_admin_token");
        sessionStorage.removeItem("sharkrypto_admin_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Real login: backend verifies email and password.
  const login = async (email, password) => {
    // Remove any previous session before attempting login.
    sessionStorage.removeItem("sharkrypto_admin_token");
    sessionStorage.removeItem("sharkrypto_admin_user");
    setUser(null);

    const response = await authApi.login(email, password);

    if (!response.token || !response.user) {
      throw new Error("Login failed: invalid server response.");
    }

    sessionStorage.setItem(
      "sharkrypto_admin_token",
      response.token
    );

    sessionStorage.setItem(
      "sharkrypto_admin_user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response.user;
  };

  // Clear the browser session.
  const logout = () => {
    sessionStorage.removeItem("sharkrypto_admin_token");
    sessionStorage.removeItem("sharkrypto_admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
