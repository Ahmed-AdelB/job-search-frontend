"use client"

import { ReactNode, useState } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePreferencesStore } from "@/stores/preferences-store"

interface ClientProviderProps {
  children: ReactNode
}

/**
 * Client-side provider wrapping theme, query, and preference management
 * Author: Ahmed Adel Bakr Alderai
 */
export default function ClientProvider({ children }: ClientProviderProps) {
  const { language } = usePreferencesStore()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
          {children}
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
