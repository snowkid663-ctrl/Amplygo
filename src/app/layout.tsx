import type { Metadata } from "next";
import { Suspense } from "react";
import Providers from "@/components/Providers";
import NavProgress from "@/components/NavProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmplyGo",
  description: "Performance-based creator marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
