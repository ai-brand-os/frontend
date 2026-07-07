import en from "@/messages/en.json";
import fa from "@/messages/fa.json";
import type { Locale } from "@/i18n/config";

export type Messages = typeof en;

const dictionaries = {
  en,
  fa,
} satisfies Record<Locale, Messages>;

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
