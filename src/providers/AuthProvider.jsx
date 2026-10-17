"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  subscribeToAuthChanges,
  loginUser as authLoginUser,
  logoutUser as authLogoutUser,
} from "@/lib/services/auth-service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Client-side route guard: redirect unauthenticated users to /login
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";

    if (!user && !isAuthRoute) {
      router.push("/login");
    } else if (user && isAuthRoute) {
      router.push("/persediaan");
    }
  }, [user, loading, pathname, router]);

  const login = async (email, password, keepSignedIn = false) => {
    return await authLoginUser(email, password, keepSignedIn);
  };

  const logout = async () => {
    const res = await authLogoutUser();
    if (res.success) {
      router.push("/login");
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
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
