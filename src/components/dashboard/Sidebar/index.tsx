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
  const orgId = typeof params.orgId === "string" ? params.orgId : "";

  const messages = getMessages(locale as Locale);
  const nav = messages.nav;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:w-60 md:border-e md:border-b-0">
      <div className="px-3 py-1">
        <OrganizationSwitcher
          locale={locale}
          orgId={orgId}
          messages={messages.organization}
          industryLabels={messages.auth.industries}
        />
      </div>

      <SidebarMenus locale={locale} orgId={orgId} />

      <div className="flex flex-col gap-3 p-3">
        <SidebarBrandCompleteness
          data={{
            progressLabel: messages.dashboard.completenessTitle,
            progress: 74,
            signOutLabel: nav.signOut,
          }}
        />
        <SidebarUserSection
          locale={locale}
          logoutFailureLabel={nav.signOutFailed}
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
