/**
 * Organization enum values, mirrored from the backend Prisma schema
 * (`Industry`, `CompanySize`). Single source for both the signup form's
 * validation schema and its select inputs; human labels live in i18n
 * messages, keyed by these values.
 */
export const industryValues = [
  "ECOMMERCE_RETAIL",
  "PROFESSIONAL_SERVICES",
  "SAAS_TECHNOLOGY",
  "HEALTH_WELLNESS",
  "FOOD_BEVERAGE",
  "EDUCATION_COACHING",
  "REAL_ESTATE",
  "FINANCE_INSURANCE",
  "MARKETING_CREATIVE_AGENCIES",
  "FASHION_APPAREL",
  "BEAUTY_PERSONAL_CARE",
  "HOME_LIFESTYLE",
  "TRAVEL_HOSPITALITY",
  "NONPROFIT_COMMUNITY",
  "MANUFACTURING_INDUSTRIAL",
  "OTHER",
] as const;

export const companySizeValues = [
  "SIZE_1_5",
  "SIZE_6_20",
  "SIZE_21_50",
  "SIZE_50_PLUS",
] as const;

export const languageValues = ["en", "fa", "ar", "tr"] as const;

export type IndustryValue = (typeof industryValues)[number];
export type CompanySizeValue = (typeof companySizeValues)[number];
export type LanguageValue = (typeof languageValues)[number];
