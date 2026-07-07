export const locales = ["en", "fa"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels = {
  en: "English",
  fa: "فارسی",
} satisfies Record<Locale, string>;

export const localeDirections = {
  en: "ltr",
  fa: "rtl",
} satisfies Record<Locale, "ltr" | "rtl">;

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
