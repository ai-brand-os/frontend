"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import type { Organization } from "../api";
import { OrganizationForm } from "./organizationForm";
import { OrganizationList } from "./organizationList";
import type { OrganizationOptionLabels } from "./organizationOptionLabels";

/** Which form is open, or `null` when only the list is shown. */
type FormState =
  | { mode: "create" }
  | { mode: "edit"; organization: Organization }
  | null;

type OrganizationViewProps = {
  messages: Messages["organization"];
  optionLabels: OrganizationOptionLabels;
};

export function OrganizationView({
  messages,
  optionLabels,
}: OrganizationViewProps) {
  const [formState, setFormState] = useState<FormState>(null);
  const closeForm = () => setFormState(null);

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            {messages.kicker}
          </p>
          <h1 className="font-heading text-[28px] leading-[1.1] font-semibold tracking-tight text-foreground">
            {messages.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {messages.subtitle}
          </p>
        </div>
        <Button
          className="h-10 gap-1.5 px-4 text-sm font-semibold"
          onClick={() => setFormState({ mode: "create" })}
        >
          <Plus className="size-4" />
          {messages.add}
        </Button>
      </div>

      {formState && (
        <OrganizationForm
          key={formState.mode === "edit" ? formState.organization.id : "create"}
          mode={formState.mode}
          organization={
            formState.mode === "edit" ? formState.organization : undefined
          }
          messages={messages}
          optionLabels={optionLabels}
          onCancel={closeForm}
          onSuccess={closeForm}
        />
      )}

      <section className="rounded-xl border border-border bg-card">
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {messages.list.title}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {messages.list.subtitle}
          </p>
        </div>
        <OrganizationList
          messages={messages}
          industryLabels={optionLabels.industries}
          onEdit={(organization) => setFormState({ mode: "edit", organization })}
        />
      </section>
    </div>
  );
}
