"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProfileContext } from "@/context/ProfileContext";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
import { getSidebarData } from "../data";
import { NavGroup } from "./nav-group";
import { ProfileDropdown } from "./profile-dropdown";
import { NavGroup as NavGroupType } from "../types";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();
  const { profile } = useProfileContext();
  const t = useTranslations("dashboard.sidebar");

  const sidebarData = getSidebarData(profile, t);
  const navGroups = sidebarData.navGroups as NavGroupType[];
  const mainGroups = navGroups.filter((g) => !g.isBottom);
  const bottomGroups = navGroups.filter((g) => g.isBottom);

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="bg-primary text-white rounded-md rounded-b-none border-none">
        <div className="flex items-center justify-start py-2">
          {state === "expanded" ? (
            <Image
              src="/img/logo-sidebar.png"
              alt="logo"
              className="ml-2 mt-2"
              width={120}
              height={120}
            />
          ) : (
            <Image
              src="/img/isotipo-quironix.png"
              alt="logo"
              width={100}
              height={100}
            />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-primary text-white">
        {mainGroups.map((groupProps: NavGroupType) => (
          <NavGroup key={groupProps.title} {...groupProps} />
        ))}
        {bottomGroups.length > 0 && (
          <div className="mt-auto">
            <SidebarSeparator className="bg-white/20 mx-2" />
            {bottomGroups.map((groupProps: NavGroupType) => (
              <NavGroup key={groupProps.title} {...groupProps} />
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="bg-primary text-white rounded-md rounded-t-none">
        {/* <div className="px-2 pb-2">
          <WebRTCLogin />
        </div> */}
        <ProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
