/**
 * Preferences Store - Zustand store for user preferences
 * Author: Ahmed Adel Bakr Alderai
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Language = "en" | "ar";
type Theme = "light" | "dark" | "system";

interface PreferencesState {
  language: Language;
  theme: Theme;
  sidebarCollapsed: boolean;

  // Actions
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleSidebar: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      language: "en",
      theme: "system",
      sidebarCollapsed: false,

      setLanguage: (language: Language) => {
        set({ language });
        // Update HTML lang attribute and dir
        if (typeof document !== "undefined") {
          document.documentElement.lang = language;
          document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        }
      },

      setTheme: (theme: Theme) => {
        set({ theme });
      },

      toggleLanguage: () => {
        const newLanguage = get().language === "en" ? "ar" : "en";
        get().setLanguage(newLanguage);
      },

      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },
    }),
    {
      name: "preferences-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
