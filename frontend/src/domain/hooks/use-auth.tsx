import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/core/api/client";
import type { User, AuthTokens, LoginCredentials } from "@/core/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsInitialized(true);
      return;
    }
    apiClient.get<User>("/auth/me/")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setIsInitialized(true));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
      setIsLoading(true);
      try {
        const { data: tokens } = await apiClient.post<AuthTokens>("/auth/login/", credentials);
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        const { data: userData } = await apiClient.get<User>("/auth/me/");
        setUser(userData);
        navigate("/");
        return { success: true };
      } catch (err: any) {
        const detail = err?.response?.data?.detail || err?.response?.data?.message || "Login failed";
        return { success: false, message: detail };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, isInitialized, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
