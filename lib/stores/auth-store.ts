// This file is deprecated. All authentication logic now uses useAuthStore.ts.
// Please use useAuthStore from lib/stores/useAuthStore.ts everywhere in the app.

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Login failed");
            }

            const data = await response.json();

            // Store token in localStorage for API requests
            localStorage.setItem("token", data.token);

            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Login failed",
              isLoading: false,
            });
          }
        },

        register: async (name, email, password) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Registration failed");
            }

            const data = await response.json();

            // Store token in localStorage for API requests
            localStorage.setItem("token", data.token);

            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Registration failed",
              isLoading: false,
            });
          }
        },

        logout: () => {
          // Remove token from localStorage
          localStorage.removeItem("token");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },

        resetPassword: async (email) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Password reset failed");
            }

            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Password reset failed",
              isLoading: false,
            });
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: "auth-store",
      }
    )
  )
);
