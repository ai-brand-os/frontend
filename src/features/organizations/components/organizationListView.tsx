"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Messages } from "@/i18n/dictionaries";
import { OrganizationList } from "./organizationList";

type OrganizationListViewProps = {
  locale: string;
  messages: Messages["organization"];
  industryLabels: Record<string, string>;
};

/** Landing page for org management: header, "add" link and the list itself. */
export function OrganizationListView({
  locale,
  messages,
  industryLabels,
}: OrganizationListViewProps) {
  const router = useRouter();
  const basePath = `/${locale}/dashboard/organization`;

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
          nativeButton={false}
          className="h-10 gap-1.5 px-4 text-sm font-semibold"
          render={<Link href={`${basePath}/new`} />}
        >
          <Plus className="size-4" />
          {messages.add}
        </Button>
      </div>

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
          industryLabels={industryLabels}
          onEdit={(organization) =>
            router.push(`${basePath}/${organization.id}/edit`)
          }
        />
      </section>
    </div>
  );
}
