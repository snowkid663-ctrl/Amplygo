"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import BrandLogo from "./BrandLogo";

export interface NavItem {
  href: string;
  label: string;
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function settingsHrefForRole(role?: string) {
  if (role === "COMPANY") return "/company/settings";
  if (role === "CREATOR") return "/creator/settings";
  if (role === "ADMIN") return "/admin/settings";
  return "/";
}

export default function AppShell({
  accountLabel,
  accountTone,
  navItems,
  title,
  headerRight,
  children,
}: {
  accountLabel: string;
  accountTone: "teal" | "accent" | "pink";
  navItems: NavItem[];
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const toneBg = accountTone === "teal" ? "var(--teal-bg)" : accountTone === "pink" ? "var(--pink-bg)" : "var(--accent-soft)";
  const toneColor = accountTone === "teal" ? "var(--teal)" : accountTone === "pink" ? "var(--pink)" : "var(--accent-text)";

  const userName = session?.user?.name ?? "Account";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? null;
  const settingsHref = settingsHrefForRole(session?.user?.role);

  return (
    <div className="app-shell">
      <div className="sidebar">
        <div style={{ padding: "8px 10px 20px" }}>
          <Link href="/" style={{ display: "block" }}>
            <BrandLogo height={32} />
          </Link>
        </div>
        <div style={{ padding: "0 10px 16px" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: toneColor,
              background: toneBg,
              padding: "4px 10px",
              borderRadius: 100,
            }}
          >
            {accountLabel}
          </span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname?.startsWith(item.href) ? "sidebar-link-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="sidebar-link"
          style={{ border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "var(--text-faint)" }}
        >
          Log out
        </button>
      </div>

      <div className="main-col">
        <div className="topbar">
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {headerRight}
            <Link href={settingsHref} className="profile-btn" title="Profile & settings">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="avatar-badge avatar-badge-img" src={userImage} alt={userName} />
              ) : (
                <span className="avatar-badge" style={{ background: toneBg, color: toneColor }}>
                  {initialsFrom(userName)}
                </span>
              )}
              <span className="profile-btn-meta">
                <span className="profile-btn-name">{userName}</span>
                {userEmail && <span className="profile-btn-email">{userEmail}</span>}
              </span>
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
