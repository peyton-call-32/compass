"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, ListChecks, Sparkles, type LucideIcon } from "lucide-react";
import { SCHOOL } from "@/lib/school";

// No login yet, so "My Matches" points at the last profile this browser saved.
export const LAST_PROFILE_KEY = "compass:lastProfileId";

export function rememberProfile(id: string) {
  try {
    localStorage.setItem(LAST_PROFILE_KEY, id);
  } catch {}
}

export function lastProfile(): string | null {
  try {
    return localStorage.getItem(LAST_PROFILE_KEY);
  } catch {
    return null;
  }
}

type NavItem = { href: string; label: string; icon: LucideIcon; active: (path: string) => boolean };

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  // No sidebar until the student finishes one of the home options and has a profile.
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    setProfileId(lastProfile());
  }, [path]);

  const nav: NavItem[] = [
    { href: "/", label: "Home", icon: Home, active: (p) => p === "/" || p === "/start/quick" || p === "/start/compare" },
    {
      href: `/matches/${profileId}`,
      label: "My Matches",
      icon: Sparkles,
      active: (p) => p.startsWith("/matches") && !p.endsWith("/plan"),
    },
    { href: `/matches/${profileId}/plan`, label: "My plan", icon: ListChecks, active: (p) => p.endsWith("/plan") },
    { href: "/start/swipe", label: "Explore Careers", icon: Compass, active: (p) => p === "/start/swipe" },
  ];

  // Home and onboarding (/start/*) never show the sidebar. It only appears in the portal
  // (matches and plan) once the student has a profile.
  const inPortal = path.startsWith("/matches");
  if (!profileId || !inPortal) return <div className="shell-main">{children}</div>;

  return (
    <div className="shell">
      <nav className="sidenav">
        <Link href="/" className="hub">
          <span className="logo">
            <Compass size={15} strokeWidth={2.25} />
          </span>
          {SCHOOL.hubName}
        </Link>
        <div className="navitems">
          {nav.map(({ href, label, icon: Icon, active }) => (
            <Link key={label} href={href} className={"navitem" + (active(path) ? " on" : "")}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
        <div className="student">
          <span className="avatar">ST</span>
          <div>
            <div className="who">Student</div>
            <div className="email">student@{SCHOOL.emailDomain}</div>
          </div>
        </div>
      </nav>
      <div className="shell-main">{children}</div>
    </div>
  );
}
