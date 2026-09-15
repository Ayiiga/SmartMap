/**
 * Phase 3 multi-language support (disabled until aiExpansionPhase3).
 * Locale catalogs are ready for Ghana + expansion markets.
 */

export type AppLocale = "en" | "fr" | "sw" | "ar" | "pt" | "tw";

export const SUPPORTED_LOCALES: { code: AppLocale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "tw", label: "Twi", native: "Twi" },
];

const STRINGS: Record<AppLocale, Record<string, string>> = {
  en: {
    search_placeholder: "Search places, services, routes…",
    sos: "SOS",
    nearby: "Nearby",
  },
  fr: {
    search_placeholder: "Rechercher lieux, services, itinéraires…",
    sos: "SOS",
    nearby: "À proximité",
  },
  sw: {
    search_placeholder: "Tafuta maeneo, huduma, njia…",
    sos: "SOS",
    nearby: "Karibu",
  },
  ar: {
    search_placeholder: "ابحث عن الأماكن والخدمات والمسارات…",
    sos: "طوارئ",
    nearby: "بالقرب",
  },
  pt: {
    search_placeholder: "Pesquisar lugares, serviços, rotas…",
    sos: "SOS",
    nearby: "Perto",
  },
  tw: {
    search_placeholder: "Hwehwɛ beae, asomdwoe, kwan…",
    sos: "SOS",
    nearby: "Bɛn",
  },
};

export function t(locale: AppLocale, key: string): string {
  return STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
}
