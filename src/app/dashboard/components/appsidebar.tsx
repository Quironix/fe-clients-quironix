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
import { PiggyBank } from "lucide-react";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="bg-primary text-white rounded-md rounded-b-none border-none">
        <div className="flex items-center justify-center py-2">
          <PiggyBank size={32} />
          {state === "expanded" && (
            <span className="text-white text-3xl font-black ml-1">Quironix</span>
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
