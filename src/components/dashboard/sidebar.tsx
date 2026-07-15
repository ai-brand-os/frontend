"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { useCurrentUser } from "@/features/auth";
import { cn } from "@/lib/utils";

export type NavKey =
  | "dashboard"
  | "products"
  | "insights"
  | "organization"
  | "settings";

export type SidebarLabels = Record<NavKey, string> & {
  brand: string;
  sectionMain: string;
  sectionManage: string;
};

export type SidebarUser = {
  /** Shown until the signed-in user hydrates from the client store, and when signed out. */
  name: string;
  role: string;
  progressLabel: string;
  progress: number;
  signOutLabel: string;
};

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

// Deterministic waveform bar heights (percent of track height) — avoids
// hydration mismatch that Math.random() would cause.
const WAVE_HEIGHTS = [
  38, 52, 66, 48, 74, 88, 60, 46, 70, 92, 64, 54, 80, 96, 68, 50, 62, 86, 58,
  44, 76, 94, 66, 48, 60, 82, 56, 42, 72, 90, 52, 40,
];

const ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  insights: BarChart3,
  organization: Building2,
  settings: Settings,
};

const SECTIONS: { labelKey: "sectionMain" | "sectionManage"; items: NavKey[] }[] =
  [
    { labelKey: "sectionMain", items: ["dashboard", "products", "insights"] },
    { labelKey: "sectionManage", items: ["organization", "settings"] },
  ];

type SidebarProps = {
  locale: string;
  labels: SidebarLabels;
  user: SidebarUser;
};

export function Sidebar({ locale, labels, user }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const displayName = currentUser?.fullName ?? user.name;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-e border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-pulse font-heading text-[15px] font-bold text-primary-foreground">
          B
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          {labels.brand}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
        {SECTIONS.map((section) => (
          <div key={section.labelKey} className="flex flex-col gap-1">
            <p className="px-3 pb-1 font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
              {labels[section.labelKey]}
            </p>
            {section.items.map((key) => {
              const Icon = ICONS[key];
              const href = `/${locale}/${key}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-sidebar-primary"
                    />
                  )}
                  <Icon className="size-4.5 shrink-0" />
                  <span className="truncate">{labels[key]}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-3 p-3">
        {/* Brand completeness — waveform */}
        <div className="rounded-xl bg-sidebar-accent/40 p-3.5">
          <div className="mb-2.5 flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-sidebar-foreground">
              {user.progressLabel}
            </span>
            <span className="font-heading text-sm font-semibold text-sidebar-accent-foreground">
              {user.progress}%
            </span>
          </div>
          <div
            className="flex h-9 items-center gap-[3px]"
            role="progressbar"
            aria-valuenow={user.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={user.progressLabel}
          >
            {WAVE_HEIGHTS.map((height, index) => {
              const filled =
                index < Math.round((user.progress / 100) * WAVE_HEIGHTS.length);
              return (
                <span
                  key={index}
                  aria-hidden
                  className={cn(
                    "w-[3px] shrink-0 rounded-full",
                    filled ? "bg-sidebar-primary" : "bg-muted-foreground/30",
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember font-heading text-[13px] font-semibold text-white">
            {toInitials(displayName)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">
              {displayName}
            </div>
            <div className="truncate font-mono text-xs text-muted-foreground">
              {user.role}
            </div>
          </div>
          <button
            type="button"
            aria-label={user.signOutLabel}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <LogOut className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </aside>
  );
}
