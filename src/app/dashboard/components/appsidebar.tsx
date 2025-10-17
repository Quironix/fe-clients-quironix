import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProfileContext } from "@/context/ProfileContext";
import Image from "next/image";
import React from "react";
import { getSidebarData } from "../data";
import { NavGroup } from "./nav-group";
import { ProfileDropdown } from "./profile-dropdown";
import { WebRTCLogin } from "./webrtc-login";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();
  const { profile } = useProfileContext();

  // Obtener la configuración del sidebar basada en el perfil del usuario
  const sidebarData = getSidebarData(profile);

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
        {/*<div className="px-2 pb-2">
          <WebRTCLogin />
        </div>*/}
        <ProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
