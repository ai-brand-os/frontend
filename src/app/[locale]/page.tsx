import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isLocale,
  localeLabels,
  locales,
  type Locale,
} from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

async function getLocale(params: HomePageProps["params"]): Promise<Locale> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return locale;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const locale = await getLocale(params);
  const messages = getMessages(locale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default async function Home({ params }: HomePageProps) {
  const locale = await getLocale(params);
  const messages = getMessages(locale);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between gap-6">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt={messages.home.logoAlt}
            width={100}
            height={20}
            priority
          />
          <nav
            aria-label={messages.home.languageLabel}
            className="flex items-center gap-3 text-sm font-medium"
          >
            {locales.map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className={
                  item === locale
                    ? "text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
                    : "text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                }
              >
                {localeLabels[item]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left rtl:sm:text-right">
          <h1 className="max-w-xs text-3xl leading-10 font-semibold tracking-tight text-black dark:text-zinc-50">
            {messages.home.title}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {messages.home.description}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel"
              width={16}
              height={16}
            />
            {messages.home.primaryAction}
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.home.secondaryAction}
          </a>
        </div>
      </main>
    </div>
  );
}
