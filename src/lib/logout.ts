import { signOut } from "next-auth/react";

const STORAGE_KEYS_TO_CLEAR = [
  "profile",
  "litigationSelection",
  "paymentPlansSelection",
  "collectorsSelection",
  "paymentNettingSelection",
];

export function clearClientStorage() {
  if (typeof window === "undefined") return;
  STORAGE_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
}

export async function logout() {
  clearClientStorage();
  await signOut({ callbackUrl: "/sign-in" });
}

export { STORAGE_KEYS_TO_CLEAR };
