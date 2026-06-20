import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

export type Role = "admin" | "parent_success_executive" | "tutor_acquisition_executive";

export interface User {
  id: number;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tutorcrm_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      localStorage.setItem("tutorcrm_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tutorcrm_user");
    }
  }, [user]);

  const login = (u: User) => {
    setUser(u);
    setLocation("/dashboard");
  };

  const logout = () => {
    setUser(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
