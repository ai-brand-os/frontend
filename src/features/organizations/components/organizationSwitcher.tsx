"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Messages } from "@/i18n/dictionaries";
import { useOrganizations } from "../api";
import { resolveOrganizationErrorMessage } from "../utils/organizationErrorDictionary";

type OrganizationSwitcherProps = {
  locale: string;
  /** The `[orgId]` segment of the current dashboard route. */
  orgId: string;
  messages: Messages["organization"];
  industryLabels: Record<string, string>;
};

/** Swaps the `[orgId]` segment of a dashboard path for another org's id. */
function withOrgId(
  pathname: string,
  locale: string,
  currentOrgId: string,
  orgId: string,
): string {
  const segments = pathname.split("/");
  if (
    currentOrgId &&
    segments[1] === locale &&
    segments[2] === "dashboard" &&
    segments[3] === currentOrgId
  ) {
    segments[3] = orgId;
    return segments.join("/");
  }
  return `/${locale}/dashboard/${orgId}`;
}

function toInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Sidebar org selector. The selected org lives in the URL, so switching is a
 * navigation rather than local state: every row links to the current page under
 * another org's id. An id that is not in the caller's membership list is
 * replaced with their first org.
 */
export function OrganizationSwitcher({
  locale,
  orgId,
  messages,
  industryLabels,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending, isError, error } = useOrganizations();

  const organizations = useMemo(() => {
    return data ?? [];
  }, [data]);
  const current = useMemo(() => {
    if (!orgId && organizations.length) {
      return organizations[0];
    }
    return organizations.find((organization) => organization.id === orgId);
  }, [organizations, orgId]);
  const firstOrgId = organizations[0]?.id;

  useEffect(() => {
    if (!orgId || current || !firstOrgId) {
      return;
    }
    router.replace(withOrgId(pathname, locale, orgId, firstOrgId));
  }, [orgId, current, firstOrgId, pathname, locale, router]);

  if (isError) {
    return (
      <p className="px-2 py-3 text-xs text-ember">
        {resolveOrganizationErrorMessage(error, messages.errors)}
      </p>
    );
  }

  // Also covers the frame between a stale id and the redirect above landing.
  if (isPending || !current) {
    if (isPending || firstOrgId) {
      return (
        <div
          aria-busy="true"
          aria-label={messages.list.loading}
          className="flex h-11 items-center gap-2.5 px-2"
        >
          <span className="size-7 shrink-0 animate-pulse rounded-lg bg-surface-2" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-3 w-28 animate-pulse rounded bg-surface-2" />
            <span className="h-2.5 w-16 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      );
    }

    return (
      <Link
        href={`/${locale}/dashboard/organization/new`}
        className="flex h-11 items-center gap-2.5 rounded-lg px-2 text-[13px] font-semibold text-pulse-ink transition-colors hover:bg-sidebar-accent/60"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pulse-soft">
          <Plus className="size-4" />
        </span>
        <span className="truncate">{messages.switcher.empty}</span>
      </Link>
    );
  }

  const identity = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pulse font-heading text-[13px] font-bold text-primary-foreground">
        {toInitial(current.name)}
      </span>
      <span className="min-w-0 flex-1 text-start leading-tight">
        <span className="block truncate text-[13px] font-semibold text-sidebar-foreground">
          {current.name}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
          {industryLabels[current.industry] ?? current.industry}
        </span>
      </span>
    </>
  );

  if (organizations.length === 1) {
    return (
      <div className="flex h-11 items-center gap-2.5 rounded-lg px-2">
        {identity}
      </div>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={messages.switcher.trigger}
        className="flex h-11 w-full items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-sidebar-accent/60 data-[popup-open]:bg-sidebar-accent"
      >
        {identity}
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--anchor-width)]"
        >
          <Menu.Popup className="rounded-xl border border-border bg-popover p-1.5 shadow-[var(--shadow-card)]">
            <div className="max-h-48 overflow-y-auto">
              {organizations.map((organization) => {
                const active = organization.id === current.id;

                return (
                  <Menu.Item
                    key={organization.id}
                    render={
                      <Link
                        href={withOrgId(
                          pathname,
                          locale,
                          orgId,
                          organization.id,
                        )}
                      />
                    }
                    className={cn(
                      "flex h-10 cursor-pointer items-center gap-2.5 rounded-md px-2 no-underline outline-none",
                      active
                        ? "bg-pulse-soft"
                        : "data-[highlighted]:bg-sidebar-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md font-heading text-[11px] font-semibold",
                        active
                          ? "bg-pulse text-primary-foreground"
                          : "bg-surface-2 text-muted-foreground",
                      )}
                    >
                      {toInitial(organization.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-popover-foreground">
                      {organization.name}
                    </span>
                    {active && (
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-pulse"
                      />
                    )}
                  </Menu.Item>
                );
              })}
            </div>

            <div aria-hidden className="my-1.5 h-px bg-border" />

            <Menu.Item
              render={<Link href={`/${locale}/dashboard/organization/new`} />}
              className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 text-[13px] font-semibold text-pulse-ink no-underline outline-none data-[highlighted]:bg-pulse-soft"
            >
              <Plus className="size-4 shrink-0" />
              {messages.form.submitCreate}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
