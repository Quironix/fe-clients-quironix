"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ProfileSubscriptionPlan {
  system_resources?: Array<{ name: string; is_enabled: boolean }>;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface ProfileSubscription {
  id?: string;
  plan: ProfileSubscriptionPlan;
  [key: string]: unknown;
}

export interface ProfileClient {
  id: string;
  name?: string;
  type?: string;
  subscriptions?: ProfileSubscription[];
  [key: string]: unknown;
}

export interface ProfileSettings {
  reconciliation_table?: Array<{ name: string; is_visible: boolean }>;
  current_account_table?: Array<{ name: string; is_visible: boolean }>;
  tracks_table?: Array<{ name: string; is_visible: boolean }>;
  litigations_table?: Array<{ name: string; is_visible: boolean }>;
  invoices_table?: Array<{ name: string; is_visible: boolean }>;
}

export interface ProfileRole {
  id?: string;
  name?: string;
  scopes?: string[];
  [key: string]: unknown;
}

export interface ProfileType {
  id: string;
  client: ProfileClient;
  client_id?: string;
  clientId?: string;
  profile?: ProfileSettings;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: string;
  roles?: ProfileRole[];
  type?: string;
  sip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export const getClientId = (profile: ProfileType | null | undefined): string =>
  profile?.client?.id ?? profile?.client_id ?? "";

type SessionType = any;

interface ProfileContextProps {
  profile: ProfileType | null;
  session: SessionType | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextProps | undefined>(
  undefined
);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status }: any = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error al obtener el perfil");
      const data = await response.json();
      setProfile(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("profile", JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    }
    if (session?.token) {
      fetchProfile();
    }
  }, [status, session?.token, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        session,
        isLoading,
        error,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext debe usarse dentro de ProfileProvider");
  }
  return context;
};
