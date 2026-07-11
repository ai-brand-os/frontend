import { describe, expect, it } from "vitest";

import { getMessages } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";

describe("getMessages", () => {
  it.each(locales)("returns a full dictionary for %s", (locale) => {
    const messages = getMessages(locale);

    expect(messages.auth.signin.title).toEqual(expect.any(String));
    expect(messages.auth.signup.title).toEqual(expect.any(String));
    expect(messages.auth.errors.emailRequired).toEqual(expect.any(String));
  });

  it("keeps the same message keys across locales", () => {
    const [en, fa] = locales.map((locale) => getMessages(locale));

    expect(Object.keys(fa.auth.fields)).toEqual(Object.keys(en.auth.fields));
    expect(Object.keys(fa.auth.errors)).toEqual(Object.keys(en.auth.errors));
  });
});
