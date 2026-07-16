import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; orgId: string }>;
}>;

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);
  const nav = messages.nav;

  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <Sidebar locale={locale} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border px-5 sm:px-8">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={nav.searchPlaceholder}
              aria-label={nav.searchPlaceholder}
              className="h-9 w-full rounded-lg border border-border bg-field ps-9 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>

          <div className="ms-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
