import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Organization",
};

type PageProps = Readonly<{ params: Promise<{ locale: string }> }>;

const MEMBERS = [
  { id: "1", name: "Ada Lovelace", email: "ada@acme.co", role: "approved" },
  { id: "2", name: "Grace Hopper", email: "grace@acme.co", role: "processing" },
  { id: "3", name: "Alan Turing", email: "alan@acme.co", role: "queued" },
] as const;

export default async function OrganizationPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);
  const t = messages.organization;
  const roleLabels = messages.dashboard.status;

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 py-8 sm:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            {t.kicker}
          </p>
          <h1 className="font-heading text-[28px] leading-[1.1] font-semibold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button className="h-10 gap-1.5 px-4 text-sm font-semibold">
          <Plus className="size-4" />
          {t.invite}
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <h2 className="px-5 pt-5 pb-4 text-[15px] font-semibold text-foreground">
          {t.members}
        </h2>
        <ul className="flex flex-col divide-y divide-border border-t border-border">
          {MEMBERS.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pulse-soft font-heading text-sm font-semibold text-pulse-ink">
                {member.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  {member.name}
                </div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {member.email}
                </div>
              </div>
              <Badge variant="muted">{roleLabels[member.role]}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
