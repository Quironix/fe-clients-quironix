"use client";
import React from "react";
import { cn } from "@/lib/utils";
import AppSidebar from "./components/appsidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { SearchProvider } from "@/context/search-context";
import { Main } from "./components/main";
import { SessionProvider } from "next-auth/react";
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { defaultOpen } = useDashboard();
  return (
    <>
      <SessionProvider>
        <SearchProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <div
              id="content"
              className={cn(
                "ml-auto w-full max-w-full",
                "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
                "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
                "sm:transition-[width] sm:duration-200 sm:ease-linear",
                "flex h-svh flex-col",
                "group-data-[scroll-locked=1]/body:h-full",
                "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh"
              )}
            >
              {children}
            </div>
          </SidebarProvider>
        </SearchProvider>
      </SessionProvider>
    </>
  );
};

export default DashboardLayout;
