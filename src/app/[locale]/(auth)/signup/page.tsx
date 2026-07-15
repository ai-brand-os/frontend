import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthForm } from "@/features/auth";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

type PageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale as Locale);
  return { title: messages.auth.signup.title };
}

export default async function SignUpPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);

  return (
    <AuthForm
      mode="signup"
      locale={locale as Locale}
      messages={messages.auth}
    />
  );
}
