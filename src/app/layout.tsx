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

export const metadata: Metadata | any = {
  title: "Aquizi",
  description: "Generate Quizzes And Study Faster Using AI",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: [
    "nextjs",
    "nextjs14",
    "next14",
    "pwa",
    "next-pwa",
    "aquizi",
    "quiz",
    "study",
    "ai",
  ],
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  authors: [
    { name: "Michel Dev Web" },
    {
      name: "Michel Dev Web",
      url: "https://www.linkedin.com/in/michel-nguyen-407950144/",
    },
  ],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
    { rel: "icon", url: "icons/icon-128x128.png" },
  ],
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
      <head>
        <title>{metadata.title as string}</title>
        <meta
          name="description"
          content={metadata.description as string}
        />
        <meta
          name="generator"
          content={metadata.generator as string}
        />
        <link
          rel="manifest"
          href={metadata.manifest as string}
        />
        <meta
          name="keywords"
          content={metadata.keywords as string}
        />
        {(metadata.themeColor as Array<{ media: string; color: string }>).map(
          ({ media, color }, index) => (
            <meta
              key={index}
              name="theme-color"
              media={media}
              content={color}
            />
          )
        )}
        {(metadata.authors as Array<{ name: string; url?: string }>).map(
          ({ name, url }, index) => (
            <meta
              key={index}
              name="author"
              content={name}
              {...(url ? { href: url } : {})}
            />
          )
        )}
        <meta
          name="viewport"
          content={metadata.viewport as string}
        />
        {(metadata.icons as []).map(({ rel, url }, index) => (
          <link
            key={index}
            rel={rel}
            href={url}
          />
        ))}
      </head>
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
