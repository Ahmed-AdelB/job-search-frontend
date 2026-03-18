/**
 * useI18n - Hook for accessing i18n translations
 * Author: Ahmed Adel Bakr Alderai
 */

import { usePreferencesStore } from "@/stores/preferences-store";
import { useMemo } from "react";
import enJSON from "@/i18n/en.json";
import arJSON from "@/i18n/ar.json";

type TranslationKeys = typeof enJSON;

const translations: Record<string, TranslationKeys> = {
  en: enJSON,
  ar: arJSON,
};

export function useI18n() {
  const language = usePreferencesStore((state) => state.language);

  const messages = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === "string" ? value : defaultValue || key;
  };

  return { t, language, messages };
}
