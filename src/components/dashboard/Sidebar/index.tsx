"use client";

import { useParams } from "next/navigation";
import { OrganizationSwitcher } from "@/features/organizations";
import { getMessages } from "@/i18n/dictionaries";
import { SidebarUserSection } from "./user";
import { SidebarBrandCompleteness } from "./BrandCompleteness";
import { Locale } from "@/i18n/config";
import { SidebarMenus } from "./Menus";

type SidebarProps = {
  locale: string;
};

export function Sidebar({ locale }: SidebarProps) {
  const params = useParams();
  const { orgId } = params;

  const messages = getMessages(locale as Locale);
  const nav = messages.nav;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-e border-sidebar-border bg-sidebar md:flex">
      <div className="px-3 py-1">
        <OrganizationSwitcher
          locale={locale}
          orgId={orgId as string}
          messages={messages.organization}
          industryLabels={messages.auth.industries}
        />
      </div>

      <SidebarMenus locale={locale} orgId={orgId as string} />

      <div className="flex flex-col gap-3 p-3">
        <SidebarBrandCompleteness
          data={{
            progressLabel: messages.dashboard.completenessTitle,
            progress: 74,
            signOutLabel: nav.signOut,
          }}
        />
        <SidebarUserSection
          user={{
            name: nav.userName,
            role: nav.userRole,
            signOutLabel: nav.signOut,
          }}
        />
      </div>
    </aside>
  );
}
