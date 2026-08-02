import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";

/** Simple readable shell for legal pages (privacy, terms). */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--card-border)" }}>
        <Link href="/" style={{ display: "inline-block" }}>
          <BrandLogo height={28} />
        </Link>
      </div>
      <div className="legal-prose" style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 96px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px" }}>{title}</h1>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 32 }}>Last updated: {updated}</div>
        {children}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--card-border)", fontSize: 13, color: "var(--text-dim)" }}>
          Questions? Contact <a href="mailto:support@amplygo.com" style={{ color: "var(--accent-text)" }}>support@amplygo.com</a>.
        </div>
      </div>
    </div>
  );
}
