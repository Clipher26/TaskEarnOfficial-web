import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, authApi, LoginPayload, RegisterPayload, AuthResponse } from "../api/authApi";
import { useAppStore } from "@/lib/store";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credentials: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const setStoreUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setStoreUser(userData);
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [setStoreUser]);

  const login = async (credentials: LoginPayload) => {
    const data = await authApi.login(credentials);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setStoreUser(data.user);
    return data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const data = await authApi.register(payload);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setStoreUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    setToken(null);
    setUser(null);
    setStoreUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
         isAdmin: user?.role === "ADMIN" || (typeof window !== "undefined" && (localStorage.getItem("admin_token") !== null || localStorage.getItem("admin_role") !== null)),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
