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

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
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
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");
            set({ user: data.user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Login failed",
              isLoading: false,
            });
            throw error;
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
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.message || "Registration failed");
            set({ user: data.user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error ? error.message : "Registration failed",
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({ user: null, isAuthenticated: false });
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            const responseData = await response.json();
            if (!response.ok)
              throw new Error(responseData.message || "Profile update failed");
            set({ user: responseData.user, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Profile update failed",
              isLoading: false,
            });
            throw error;
          }
        },

        resetPassword: async (email) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.message || "Password reset failed");
            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Password reset failed",
              isLoading: false,
            });
            throw error;
          }
        },

        changePassword: async (currentPassword, newPassword) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch("/api/auth/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.message || "Password change failed");
            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Password change failed",
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: "user-store",
      }
    )
  )
);
