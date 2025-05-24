"use client";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { Briefcase, ChevronsUpDown, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import useProfile from "@/hooks/useProfile";
import { useEffect } from "react";
export const ProfileDropdown = () => {
  const { state } = useSidebar();
  const { data: session }: any = useSession();
  const { profile, isLoadingProfile } = useProfile();

  useEffect(() => {
    console.log(profile);
    console.log(session);
  }, [profile, session]);

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
            <div className="flex-shrink-0 flex items-center justify-center bg-[#0233A3] text-white rounded-md p-2">
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
                {isLoadingProfile && !profile
                  ? "Cargando..."
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
              <Link href="/settings">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled>
              <Link href="/settings">Configuraciones</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
