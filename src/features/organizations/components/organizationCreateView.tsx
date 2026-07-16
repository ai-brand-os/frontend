"use client";

import { useRouter } from "next/navigation";

import type { Messages } from "@/i18n/dictionaries";
import { OrganizationForm } from "./organizationForm";
import type { OrganizationOptionLabels } from "./organizationOptionLabels";

type OrganizationCreateViewProps = {
  locale: string;
  messages: Messages["organization"];
  optionLabels: OrganizationOptionLabels;
};

/** Dedicated page for creating an organization. */
export function OrganizationCreateView({
  locale,
  messages,
  optionLabels,
}: OrganizationCreateViewProps) {
  const router = useRouter();
  const backToList = () => router.push(`/${locale}/dashboard/organization`);

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
      <OrganizationForm
        mode="create"
        messages={messages}
        optionLabels={optionLabels}
        onCancel={backToList}
        onSuccess={backToList}
      />
    </div>
  );
}
