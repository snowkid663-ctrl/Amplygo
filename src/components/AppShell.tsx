"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  // Close the menu whenever we navigate.
  useEffect(() => setMenuOpen(false), [pathname]);

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
      </div>

      <div className="main-col">
        <div className="topbar">
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {headerRight}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="profile-btn"
                title="Account"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
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
                <svg className={`profile-btn-caret ${menuOpen ? "open" : ""}`} width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {menuOpen && (
                <div className="profile-menu fu" role="menu">
                  <div className="profile-menu-head">
                    <div className="profile-menu-name">{userName}</div>
                    {userEmail && <div className="profile-menu-email">{userEmail}</div>}
                  </div>
                  <Link href={settingsHref} className="profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="profile-menu-item profile-menu-danger"
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
