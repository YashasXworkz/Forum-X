import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/App";

interface MatrixLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatrixLoading({ size = "md", className }: MatrixLoadingProps) {
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";
  
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };
  
  if (!isMatrix) {
    // Default spinner for non-matrix themes
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "border-2 rounded-full border-t-transparent animate-spin",
            sizeMap[size],
            theme === "dark" ? "border-white" : "border-black"
          )}
        />
      </div>
    );
  }
  
  // Matrix themed spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeMap[size])}>
        {/* Outer ring */}
        <div
          className="absolute inset-0 border-2 border-hsl-matrix-green rounded-full animate-pulse-subtle scale-100"
          style={{
            boxShadow: "0 0 7px 0 hsla(var(--matrix-green), 0.7)"
          }}
        />
        
        {/* Matrix code segments around spinner */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute font-mono text-hsl-matrix-green text-xs matrix-glow animate-pulse-subtle"
            style={{
              transform: `rotate(${i * 60}deg) translateY(-50%)`,
              top: "50%",
              left: "50%",
              transformOrigin: "0% 50%",
              animationDelay: `${i * 0.2}s`
            }}
          >
            {i % 2 === 0 ? "10" : "01"}
          </div>
        ))}
        
        {/* Inner circle */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-hsl-matrix-dark border border-hsl-matrix-green/70 rounded-full animate-spin"
          style={{
            width: "60%",
            height: "60%",
            boxShadow: "0 0 10px 0 hsla(var(--matrix-green), 0.6) inset",
            animationDuration: "4s"
          }}
        />
        
        {/* Center dot */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-hsl-matrix-green rounded-full animate-pulse-subtle"
          style={{
            width: "20%",
            height: "20%",
            boxShadow: "0 0 10px 0 hsla(var(--matrix-green), 0.8)"
          }}
        />
      </div>
    </div>
  );
} 