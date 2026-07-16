"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Database,
  Building2,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { getMessages } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

type TSectionKey = "sectionMain" | "sectionManage";

type NavKey =
  | "dashboard"
  | "brandBrain"
  | "knowledgeBase"
  | "aiWorkspace"
  | "organization"
  | "settings";

type MenuSection = {
  labelKey: TSectionKey;
  menus: {
    key: NavKey;
    href: string;
  }[];
};

export type TLabels = Record<NavKey, string> & {
  brand: string;
  sectionMain: string;
  sectionManage: string;
};

const ICONS: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  brandBrain: Brain,
  knowledgeBase: Database,
  aiWorkspace: MessageCircle,
  organization: Building2,
  settings: Settings,
};

const SidebarMenus = ({ locale, orgId }: { locale: string; orgId: string }) => {
  const pathname = usePathname();
  const messages = getMessages(locale as Locale);
  const nav = messages.nav;

  const labels: TLabels = {
    brand: nav.brand,
    sectionMain: nav.sectionMain,
    sectionManage: nav.sectionManage,
    dashboard: nav.dashboard,
    brandBrain: nav.brandBrain,
    knowledgeBase: nav.knowledgeBase,
    aiWorkspace: nav.aiWorkspace,
    organization: nav.organization,
    settings: nav.settings,
  };

  const SECTIONS = useMemo((): MenuSection[] => {
    return [
      {
        labelKey: "sectionMain",
        menus: [
          {
            key: "dashboard",
            href: `/${locale}/dashboard/${orgId}`,
          },
          {
            key: "brandBrain",
            href: `/${locale}/dashboard/${orgId}/brand-brain`,
          },
          {
            key: "knowledgeBase",
            href: `/${locale}/dashboard/${orgId}/knowledge`,
          },
          {
            key: "aiWorkspace",
            href: `/${locale}/dashboard/${orgId}/workspace`,
          },
        ],
      },
      {
        labelKey: "sectionManage",
        menus: [
          {
            key: "organization",
            href: `/${locale}/dashboard/organization`,
          },
          {
            key: "settings",
            href: `/${locale}/dashboard/settings`,
          },
        ],
      },
    ];
  }, [locale, orgId]);

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
      {SECTIONS.map((section) => (
        <div key={section.labelKey} className="flex flex-col gap-1">
          <p className="px-3 pb-1 font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            {labels[section.labelKey]}
          </p>
          {section.menus.map((menu) => {
            const Icon = ICONS[menu.key];
            const href = menu.href;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={menu.key}
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
                <span className="truncate">{labels[menu.key]}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
};

export { SidebarMenus };
