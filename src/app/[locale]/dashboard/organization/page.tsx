import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationListView } from "@/features/organizations";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Organization",
};

type PageProps = Readonly<{ params: Promise<{ locale: string }> }>;

export default async function OrganizationPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);

  return (
    <OrganizationListView
      locale={locale}
      messages={messages.organization}
      industryLabels={messages.auth.industries}
    />
  );
}
