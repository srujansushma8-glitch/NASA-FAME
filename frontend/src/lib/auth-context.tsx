"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  clearance_level: string;
  station: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "nasa_flame_auth_token";
const USER_KEY = "nasa_flame_user_profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restore authenticated session on initial mount
  useEffect(() => {
    async function restoreSession() {
      try {
        // Detect if page was refreshed / reloaded
        let isReload = false;
        try {
          if (typeof window !== "undefined") {
            const navEntries = performance.getEntriesByType("navigation");
            if (navEntries.length > 0) {
              isReload = (navEntries[0] as PerformanceNavigationTiming).type === "reload";
            } else if ((window.performance?.navigation as any)?.type === 1) {
              isReload = true;
            }
          }
        } catch (e) {}

        // If page is refreshed: always redirect to landing page ("/") and reset session
        if (isReload) {
          clearStoredSession();
          setIsLoading(false);
          if (typeof window !== "undefined" && window.location.pathname !== "/") {
            window.location.replace("/");
          }
          return;
        }

        const storedToken =
          localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
        const storedUser =
          localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token validity against backend API
          try {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res.ok) {
              const freshUser = await res.json();
              setUser(freshUser);
              localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
            } else if (res.status === 401) {
              // Token expired
              clearStoredSession();
            }
          } catch (e) {
            // Keep stored profile if backend is temporarily unreachable
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const clearStoredSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (!res.ok) {
        let errMessage = "Authentication failed. Please verify credentials.";
        try {
          const data = await res.json();
          errMessage = data.detail || data.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await res.json();
      const accessToken = data.access_token;
      const userProfile = data.user;

      setToken(accessToken);
      setUser(userProfile);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, accessToken);
      storage.setItem(USER_KEY, JSON.stringify(userProfile));

      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    clearStoredSession();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        clearSession: clearStoredSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

