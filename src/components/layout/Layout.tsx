
import React from "react";
import { Header } from "./Header";
import { AppSidebar } from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex-1 pt-4 pb-12 animate-fade-in">
            <div className="container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
