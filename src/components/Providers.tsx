"use client";
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AuthProvider } from "@/lib/firebase/firebase-auth";
import { setupViewportHeight } from "@/lib/viewport-height";
import { LanguageProvider } from "@/contexts/LanguageContext";

const queryClient = new QueryClient();

const Providers = ({ children }: ThemeProviderProps) => {
  // Set up viewport height fix for mobile devices
  useEffect(() => {
    // Setup viewport height and get cleanup function
    const cleanup = setupViewportHeight();
    
    // Clean up event listeners on unmount
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};

export default Providers;
