import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthApi, toApiError } from "../services/api";

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: "buyer" | "planner" | "approver" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set): AuthStore => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          if (!email || !password) {
            throw new Error("Please enter both email and password");
          }

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            throw new Error("Please enter a valid email address");
          }

          // Call the real API using AuthApi
          const res = await AuthApi.login({ email, password });
          const { accessToken, refreshToken } = res.data;

          const user: User = {
            id: "user_001", // TODO: get from JWT token or API response
            email: email,
            username: email.split("@")[0],
            full_name: "User", // TODO: get from API response
            role: "admin", // TODO: get from JWT token or API response
          };

          set({
            user: user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const apiError = toApiError(error);
          set({
            error: apiError.message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear localStorage
        localStorage.removeItem("auth-storage");
        // Redirect to login page
        window.location.href = "/login";
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
