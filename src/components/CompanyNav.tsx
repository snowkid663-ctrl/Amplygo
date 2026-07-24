"use client";

import AppShell, { NavItem } from "./AppShell";

const items: NavItem[] = [
  { href: "/company/dashboard", label: "Dashboard" },
  { href: "/company/campaigns", label: "Campaigns" },
  { href: "/company/settings", label: "Settings" },
];

export default function CompanyNav({ title, headerRight, children }: { title: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <AppShell accountLabel="Company account" accountTone="teal" navItems={items} title={title} headerRight={headerRight}>
      {children}
    </AppShell>
  );
}
