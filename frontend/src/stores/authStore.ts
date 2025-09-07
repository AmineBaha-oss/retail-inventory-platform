import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Organization, UserRole } from "../types/api";

interface AuthUser extends User {
  full_name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setOrganization: (organization: Organization | null) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isCustomerAdmin: () => boolean;
  isCustomerUser: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      organization: null,
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

          // Call the Spring Boot API
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              password: password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Login failed");
          }

          const data = await response.json();

          // Extract user info from the response
          const user: AuthUser = {
            id: data.user?.id || "user_001",
            email: data.user?.email || email,
            username: data.user?.username || email.split("@")[0],
            firstName: data.user?.firstName,
            lastName: data.user?.lastName,
            full_name:
              data.user?.fullName ||
              `${data.user?.firstName || ""} ${
                data.user?.lastName || ""
              }`.trim() ||
              "User",
            phone: data.user?.phone,
            status: data.user?.status || "ACTIVE",
            emailVerified: data.user?.emailVerified || false,
            twoFactorEnabled: data.user?.twoFactorEnabled || false,
            lastLoginAt: data.user?.lastLoginAt,
            lastLoginIp: data.user?.lastLoginIp,
            roles: data.user?.roles || ["CUSTOMER_USER"],
            organizationId: data.user?.organizationId,
            organizationName: data.user?.organizationName,
            createdAt: data.user?.createdAt || new Date().toISOString(),
            updatedAt: data.user?.updatedAt || new Date().toISOString(),
          };

          // Extract organization info if available
          const organization: Organization | null = data.organization
            ? {
                id: data.organization.id,
                name: data.organization.name,
                slug: data.organization.slug,
                description: data.organization.description,
                website: data.organization.website,
                phone: data.organization.phone,
                email: data.organization.email,
                address: data.organization.address,
                status: data.organization.status,
                subscriptionPlan: data.organization.subscriptionPlan,
                maxUsers: data.organization.maxUsers,
                trialEndsAt: data.organization.trialEndsAt,
                createdAt: data.organization.createdAt,
                updatedAt: data.organization.updatedAt,
              }
            : null;

          set({
            user: user,
            organization: organization,
            token: data.accessToken || data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          organization: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear localStorage
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("currentOrganization");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("organizations");
        // Redirect to login page
        window.location.href = "/login";
      },

      setUser: (user: AuthUser) => {
        set({ user });
      },

      setOrganization: (organization: Organization | null) => {
        set({ organization });
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

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.roles.includes(role) ?? false;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.roles.includes("ADMIN") ?? false;
      },

      isCustomerAdmin: () => {
        const { user } = get();
        return user?.roles.includes("CUSTOMER_ADMIN") ?? false;
      },

      isCustomerUser: () => {
        const { user } = get();
        return user?.roles.includes("CUSTOMER_USER") ?? false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
