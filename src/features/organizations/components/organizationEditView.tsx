"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import { useOrganizations } from "../api";
import type { OrgRole } from "../api";
import { resolveOrganizationErrorMessage } from "../utils/organizationErrorDictionary";
import { OrganizationForm } from "./organizationForm";
import type { OrganizationOptionLabels } from "./organizationOptionLabels";

/** Roles the backend accepts for `PATCH /organizations/:id`. */
const CAN_EDIT_ROLES = new Set<OrgRole>(["OWNER", "ADMIN"]);

type OrganizationEditViewProps = {
  locale: string;
  orgId: string;
  messages: Messages["organization"];
  optionLabels: OrganizationOptionLabels;
};

/** Dedicated page for editing an organization, resolved from the org list. */
export function OrganizationEditView({
  locale,
  orgId,
  messages,
  optionLabels,
}: OrganizationEditViewProps) {
  const router = useRouter();
  const listPath = `/${locale}/dashboard/organization`;
  const { data, isPending, isError, error, refetch, isRefetching } =
    useOrganizations();

  const organization = useMemo(
    () => data?.find((item) => item.id === orgId),
    [data, orgId],
  );
  const canEdit = organization && CAN_EDIT_ROLES.has(organization.role);

  useEffect(() => {
    if (!isPending && !isError && !canEdit) {
      router.replace(listPath);
    }
  }, [isPending, isError, canEdit, router, listPath]);

  const backToList = () => router.push(listPath);

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card px-5 py-8">
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
      </div>
    );
  }

  if (isPending || !canEdit) {
    return (
      <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
        <div
          aria-busy="true"
          aria-label={messages.list.loading}
          className="h-64 animate-pulse rounded-xl border border-border bg-card"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
      <OrganizationForm
        mode="edit"
        organization={organization}
        messages={messages}
        optionLabels={optionLabels}
        onCancel={backToList}
        onSuccess={backToList}
      />
    </div>
  );
}
