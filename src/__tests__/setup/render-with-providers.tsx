/**
 * Custom render wrapper with all providers for testing
 * Author: Ahmed Adel Bakr Alderai
 */

import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProviderOptions {
  theme?: "light" | "dark" | "system";
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function AllProviders({
  children,
}: {
  children: React.ReactNode;
} & ProviderOptions) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & ProviderOptions
) {
  const { theme, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: (props) => <AllProviders {...props} theme={theme} />,
    ...renderOptions,
  });
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

export { createTestQueryClient };
