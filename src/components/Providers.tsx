"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import CardSpotlight from "./CardSpotlight";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CardSpotlight />
      {children}
    </SessionProvider>
  );
}
