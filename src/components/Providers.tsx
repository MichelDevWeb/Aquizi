"use client";
import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { AuthProvider } from "@/lib/firebase/firebase-auth";

const queryClient = new QueryClient();

const Providers = ({ children }: ThemeProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};

export default Providers;
