/**
 * Auth Store - Zustand store for authentication state
 * Author: Ahmed Adel Bakr Alderai
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiPost } from "@/lib/api-client";
import { setToken, removeToken, setUser, removeUser } from "@/lib/auth";

export interface User {
  user_id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
  name?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
}

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

          // Store in localStorage
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
          } as SignupRequest);

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
        const isAuth = !!token;
        set({ isAuthenticated: isAuth });
        return isAuth;
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
