"use client";

import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import { useOrganizations } from "../api";
import type { OrganizationMembership, OrgRole } from "../api";
import { resolveOrganizationErrorMessage } from "../utils/organizationErrorDictionary";

const ROLE_VARIANT: Record<OrgRole, "default" | "secondary" | "muted"> = {
  OWNER: "default",
  ADMIN: "secondary",
  EDITOR: "muted",
  VIEWER: "muted",
};

/** Roles the backend accepts for `PATCH /organizations/:id`. */
const CAN_EDIT_ROLES = new Set<OrgRole>(["OWNER", "ADMIN"]);

const SKELETON_ROWS = [0, 1, 2];

type OrganizationListProps = {
  messages: Messages["organization"];
  industryLabels: Record<string, string>;
  onEdit: (organization: OrganizationMembership) => void;
};

export function OrganizationList({
  messages,
  industryLabels,
  onEdit,
}: OrganizationListProps) {
  const { data, isPending, isError, error, refetch, isRefetching } =
    useOrganizations();

  if (isPending) {
    return (
      <ul
        aria-busy="true"
        aria-label={messages.list.loading}
        className="flex flex-col divide-y divide-border border-t border-border"
      >
        {SKELETON_ROWS.map((row) => (
          <li key={row} className="flex items-center gap-3 px-5 py-4">
            <span className="size-9 shrink-0 animate-pulse rounded-lg bg-surface-2" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="h-3.5 w-40 animate-pulse rounded bg-surface-2" />
              <span className="h-3 w-24 animate-pulse rounded bg-surface-2" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 border-t border-border px-5 py-8">
        <p className="text-sm text-ember">
          {resolveOrganizationErrorMessage(error, messages.errors)}
        </p>
        <Button
          variant="outline"
          className="h-8 px-3 text-[13px] font-semibold"
          disabled={isRefetching}
          onClick={() => refetch()}
        >
          {messages.list.retry}
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="border-t border-border px-5 py-10 text-center text-sm text-muted-foreground">
        {messages.list.empty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border border-t border-border">
      {data.map((organization) => (
        <li
          key={organization.id}
          className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pulse-soft text-pulse-ink">
            <Building2 className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {organization.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {industryLabels[organization.industry] ?? organization.industry}
            </div>
          </div>
          <Badge variant={ROLE_VARIANT[organization.role]}>
            {messages.roles[organization.role]}
          </Badge>
          {CAN_EDIT_ROLES.has(organization.role) && (
            <Button
              variant="ghost"
              className="h-8 px-2.5 text-[13px] font-semibold text-pulse-ink"
              onClick={() => onEdit(organization)}
            >
              {messages.form.edit}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
