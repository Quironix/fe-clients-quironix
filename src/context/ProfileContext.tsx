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

type ProfileType = any; // Puedes tipar mejor según tu modelo
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
