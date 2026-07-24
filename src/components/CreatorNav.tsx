"use client";

import AppShell, { NavItem } from "./AppShell";

const items: NavItem[] = [
  { href: "/creator/dashboard", label: "Dashboard" },
  { href: "/creator/browse", label: "Browse campaigns" },
  { href: "/creator/my-campaigns", label: "My campaigns" },
  { href: "/creator/earnings", label: "Earnings" },
  { href: "/creator/settings", label: "Settings" },
];

export default function CreatorNav({ title, headerRight, children }: { title: string; headerRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <AppShell accountLabel="Creator account" accountTone="accent" navItems={items} title={title} headerRight={headerRight}>
      {children}
    </AppShell>
  );
}
