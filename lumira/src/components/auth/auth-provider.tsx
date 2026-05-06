"use client";

import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuth();
  return <>{children}</>;
}
