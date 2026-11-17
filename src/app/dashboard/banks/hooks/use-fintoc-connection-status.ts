"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FintocAccountConnection,
  getFintocConnectionStatus,
} from "../services/fintoc.service";

const CACHE_MS = 5 * 60 * 1000;
const REFRESH_MS = 10 * 60 * 1000;

let cache: {
  clientId: string;
  at: number;
  data: FintocAccountConnection[];
} | null = null;

export const useFintocConnectionStatus = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const clientId = profile?.client?.id;
  const [accounts, setAccounts] = useState<FintocAccountConnection[]>(
    cache && cache.clientId === clientId ? cache.data : [],
  );

  useEffect(() => {
    const token = session?.token;
    if (!token || !clientId) return;

    const load = (force = false) => {
      if (
        !force &&
        cache?.clientId === clientId &&
        Date.now() - cache.at < CACHE_MS
      ) {
        setAccounts(cache.data);
        return;
      }
      getFintocConnectionStatus(token, clientId)
        .then((data) => {
          cache = { clientId, at: Date.now(), data };
          setAccounts(data);
        })
        .catch(() => setAccounts([]));
    };

    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [session?.token, clientId]);

  return accounts;
};
