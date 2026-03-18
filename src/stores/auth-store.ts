/**
 * Auth Store - Zustand store for authentication state
 * Author: Ahmed Adel Bakr Alderai
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiPost } from "@/lib/api-client";
import { setToken, removeToken, setUser, removeUser } from "@/lib/auth";
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  clearError: () => void;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiPost<AuthResponse>("/auth/login", {
            email,
            password,
          } as LoginRequest);

          const user: User = {
            user_id: response.user_id,
            email: response.email,
            name: response.name,
          };

          setToken(response.token);
          setUser(user);

          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login failed";
          set({ isLoading: false, error: message });
          return false;
        }
      },

      signup: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          await apiPost<AuthResponse>("/auth/register", {
            email,
            password,
          } as RegisterRequest);

          set({ isLoading: false });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Signup failed";
          set({ isLoading: false, error: message });
          return false;
        }
      },

      logout: () => {
        removeToken();
        removeUser();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      checkAuth: () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }
        if (isTokenExpired(token)) {
          removeToken();
          removeUser();
          set({ isAuthenticated: false, token: null, user: null });
          return false;
        }
        set({ isAuthenticated: true });
        return true;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
