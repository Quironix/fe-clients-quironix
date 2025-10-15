"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchProvider } from "@/context/search-context";
import { WebRTCProvider } from "@/context/WebRTCContext";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import React from "react";
import AppSidebar from "./components/appsidebar";
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { defaultOpen } = useDashboard();
  return (
    <>
      <WebRTCProvider>
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
                "min-h-screen overflow-y-auto"
              )}
            >
              {children}
            </div>
          </SidebarProvider>
        </SearchProvider>
      </WebRTCProvider>
    </>
  );
};

export default DashboardLayout;
