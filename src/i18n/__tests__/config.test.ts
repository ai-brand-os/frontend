import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  isLocale,
  localeDirections,
  locales,
} from "@/i18n/config";

describe("isLocale", () => {
  it.each(locales)("accepts the supported locale %s", (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it("rejects unsupported locale strings", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("defaultLocale", () => {
  it("is one of the supported locales", () => {
    expect(locales).toContain(defaultLocale);
  });
});

describe("localeDirections", () => {
  it("marks Persian as right-to-left", () => {
    expect(localeDirections.fa).toBe("rtl");
  });

  it("marks English as left-to-right", () => {
    expect(localeDirections.en).toBe("ltr");
  });
});
