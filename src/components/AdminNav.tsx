"use client";

import AppShell, { NavItem } from "./AppShell";

const items: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ title, headerRight, children }: { title: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <AppShell accountLabel="Admin account" accountTone="pink" navItems={items} title={title} headerRight={headerRight}>
      {children}
    </AppShell>
  );
}
