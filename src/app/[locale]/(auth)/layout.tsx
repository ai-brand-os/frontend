import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <header className="flex items-center justify-between px-7 py-5">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span className="flex size-[26px] items-center justify-center rounded-lg bg-pulse font-heading text-[15px] font-bold text-primary-foreground">
            B
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {messages.auth.brandName}
          </span>
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(var(--dotgrid)_1px,transparent_1px)] bg-[length:22px_22px]"
        />
        {children}
      </main>
    </div>
  );
}
