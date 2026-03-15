"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/logout";
import { Briefcase, ChevronsUpDown, User } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const ProfileDropdown = () => {
  const { state } = useSidebar();
  const { profile, session, isLoading } = useProfileContext();
  const t = useTranslations("dashboard.profile");

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "flex items-center border-t border-white py-3 gap-2",
              state === "expanded" ? "justify-start" : "justify-center"
            )}
          >
            <div className="shrink-0 flex items-center justify-center bg-[#0233A3] text-white rounded-md p-2">
              <User />
            </div>
            {state === "expanded" && (
              <div className="cursor-pointer">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-bold">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <small className="text-white text-xs leading-none flex justify-start items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {profile?.client?.name}
                    </small>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 ml-2" />
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">
                {isLoading && !profile
                  ? t("loading")
                  : profile?.first_name + " " + profile?.last_name}
              </p>

              <p className="text-muted-foreground text-xs leading-none">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild disabled>
              <Link href="/settings">{t("myProfile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled>
              <Link href="/settings">{t("settings")}</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
