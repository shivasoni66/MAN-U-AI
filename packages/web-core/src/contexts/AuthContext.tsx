import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserDTO } from "@man-u-ai/shared";
import { disconnectSocket } from "../lib/api";

export interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (token: string, user: UserDTO) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("manuai_token") : null;
      const userRaw = typeof localStorage !== "undefined" ? localStorage.getItem("manuai_user") : null;
      if (token && userRaw) {
        const user: UserDTO = JSON.parse(userRaw);
        return { user, token, isAuthenticated: true, isLoading: false };
      }
    } catch {}
    return { user: null, token: null, isAuthenticated: false, isLoading: false };
  });

  const login = useCallback((token: string, user: UserDTO) => {
    disconnectSocket();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("manuai_token", token);
      localStorage.setItem("manuai_user", JSON.stringify(user));
    }
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("manuai_token");
      localStorage.removeItem("manuai_user");
    }
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => {},
      logout: () => {},
    };
  }
  return ctx;
}
