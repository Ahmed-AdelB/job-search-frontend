"use client"

import { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePreferencesStore } from "@/stores/preferences-store"

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

interface ClientProviderProps {
  children: ReactNode
}

/**
 * Client-side provider wrapping theme, query, and preference management
 * Author: Ahmed Adel Bakr Alderai
 */
export default function ClientProvider({ children }: ClientProviderProps) {
  const { language } = usePreferencesStore()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
          {children}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
