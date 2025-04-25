import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { AppSidebar } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden fixed inset-0">
        {/* Matrix Rain Effect (Only visible in matrix theme) */}
        {isMatrix && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
            <MatrixRain />
          </div>
        )}
        
        <AppSidebar />
        
        <div className="flex-1 flex flex-col h-full">
          <Header />
          <main 
            className={cn(
              "flex-1 pt-0 pb-0 animate-fade-in overflow-auto",
              isMatrix ? "text-hsl-matrix-green" : ""
            )}
          >
            <div className={cn(
              "container px-4 py-4 md:px-6 pb-6",
              isMatrix && "matrix-card rounded-lg"
            )}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Matrix Rain Animation Component
const MatrixRain = () => {
  return (
    <div className="matrix-rain-container h-full w-full">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="matrix-rain text-hsl-matrix-green text-lg font-mono absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${20 + Math.random() * 80}px`,
            opacity: 0.5 + Math.random() * 0.5,
            animationDuration: `${3 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        >
          {getRandomMatrixCharacters()}
        </div>
      ))}
    </div>
  );
};

// Helper function to generate random Matrix-like characters
const getRandomMatrixCharacters = () => {
  const characters = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890";
  return Array.from({ length: 10 }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};
