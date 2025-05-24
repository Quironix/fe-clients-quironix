import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useProfile = () => {
  const { data: session }: any = useSession();
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }
    );
    const data = await response.json();
    setProfile(data);
    setIsLoadingProfile(false);
  };

  return { profile, isLoadingProfile };
};

export default useProfile;
