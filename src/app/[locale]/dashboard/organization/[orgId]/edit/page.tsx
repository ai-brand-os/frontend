import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrganizationEditView } from "@/features/organizations";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Edit organization",
};

type PageProps = Readonly<{
  params: Promise<{ locale: string; orgId: string }>;
}>;

export default async function EditOrganizationPage({ params }: PageProps) {
  const { locale, orgId } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);

  return (
    <OrganizationEditView
      locale={locale}
      orgId={orgId}
      messages={messages.organization}
      optionLabels={{
        industries: messages.auth.industries,
        companySizes: messages.auth.companySizes,
        languages: messages.auth.languages,
      }}
    />
  );
}
