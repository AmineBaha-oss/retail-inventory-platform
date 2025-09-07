import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Organization, User } from "../types/api";

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentUser: User | null;
  organizations: Organization[];
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentUser: (user: User | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  isAdmin: boolean;
  isCustomerAdmin: boolean;
  isCustomerUser: boolean;
  canManageUsers: boolean;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
}) => {
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived state
  const isAdmin = currentUser?.roles.includes("ADMIN") ?? false;
  const isCustomerAdmin =
    currentUser?.roles.includes("CUSTOMER_ADMIN") ?? false;
  const isCustomerUser = currentUser?.roles.includes("CUSTOMER_USER") ?? false;
  const canManageUsers = isAdmin || isCustomerAdmin;

  // Load organization and user data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedOrg = localStorage.getItem("currentOrganization");
        const storedUser = localStorage.getItem("currentUser");
        const storedOrgs = localStorage.getItem("organizations");

        if (storedOrg) {
          setCurrentOrganization(JSON.parse(storedOrg));
        }
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        if (storedOrgs) {
          setOrganizations(JSON.parse(storedOrgs));
        }
      } catch (error) {
        console.error("Error loading organization data from storage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem(
        "currentOrganization",
        JSON.stringify(currentOrganization)
      );
    } else {
      localStorage.removeItem("currentOrganization");
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    if (organizations.length > 0) {
      localStorage.setItem("organizations", JSON.stringify(organizations));
    } else {
      localStorage.removeItem("organizations");
    }
  }, [organizations]);

  const value: OrganizationContextType = {
    currentOrganization,
    currentUser,
    organizations,
    setCurrentOrganization,
    setCurrentUser,
    setOrganizations,
    isAdmin,
    isCustomerAdmin,
    isCustomerUser,
    canManageUsers,
    loading,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
