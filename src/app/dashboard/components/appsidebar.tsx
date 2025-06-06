import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";
import { sidebarData } from "../data";
import { NavGroup } from "./nav-group";
import { ProfileDropdown } from "./profile-dropdown";
import Image from "next/image";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();
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
        {sidebarData.navGroups.map((props: any) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="bg-primary text-white rounded-md rounded-t-none">
        <ProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
