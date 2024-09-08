import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import LoadingSpinner from "@/components/LoadingSpinner";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aquizi",
  description: "Generate Quizzes And Study Faster Using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
    >
      <body className={cn(inter.className, "antialiased min-h-screen pt-16")}>
        {/* <Header /> */}
        <Providers>
          <NavBar />
          {children}
          <Toaster />
          <LoadingSpinner />
        </Providers>
      </body>
    </html>
  );
}
