import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationCreateView } from "@/features/organizations";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Add organization",
};

type PageProps = Readonly<{ params: Promise<{ locale: string }> }>;

export default async function NewOrganizationPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);

  return (
    <OrganizationCreateView
      locale={locale}
      messages={messages.organization}
      optionLabels={{
        industries: messages.auth.industries,
        companySizes: messages.auth.companySizes,
        languages: messages.auth.languages,
      }}
    />
  );
}
