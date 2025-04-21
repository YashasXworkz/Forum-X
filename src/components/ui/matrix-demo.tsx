import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { MatrixLoading } from "./matrix-loading";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";

export function MatrixDemo() {
  const { theme } = useTheme();
  const isMatrix = theme === "matrix";
  
  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* Typography Examples */}
      <div className="stagger-fade-in">
        <Card className={isMatrix ? "matrix-card" : ""}>
          <CardHeader>
            <CardTitle className={isMatrix ? "text-hsl-matrix-green matrix-glow" : ""}>
              Typography
            </CardTitle>
            <CardDescription className={isMatrix ? "text-hsl-matrix-green/70" : ""}>
              Text elements with matrix styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                isMatrix && "text-hsl-matrix-green matrix-glow"
              )}>
                Matrix Heading
              </h1>
              <p className={isMatrix ? "text-hsl-matrix-green/80" : ""}>
                Regular paragraph text with matrix styling when theme is active.
              </p>
            </div>
            
            <div>
              <h2 
                className={cn(
                  "text-xl font-semibold", 
                  isMatrix && "text-glitch"
                )}
                data-text="Glitch Effect"
              >
                Glitch Effect
              </h2>
              <p className={isMatrix ? "text-hsl-matrix-green/70" : ""}>
                Text with glitch animation effect in matrix theme.
              </p>
            </div>
            
            <div className={cn(
              "font-mono text-sm",
              isMatrix && "text-hsl-matrix-green"
            )}>
              <pre className={isMatrix ? "bg-hsl-matrix-dark/50 p-2 rounded matrix-border" : "bg-muted p-2 rounded"}>
{`# Matrix code example
function access_mainframe() {
  return decrypt(matrix_code);
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Interactive Elements */}
      <div className="stagger-fade-in">
        <Card className={isMatrix ? "matrix-card" : ""}>
          <CardHeader>
            <CardTitle className={isMatrix ? "text-hsl-matrix-green matrix-glow" : ""}>
              Interactive Elements
            </CardTitle>
            <CardDescription className={isMatrix ? "text-hsl-matrix-green/70" : ""}>
              Buttons and inputs with matrix styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label 
                className={cn(
                  "text-sm font-medium",
                  isMatrix && "text-hsl-matrix-green"
                )}
              >
                Username
              </label>
              <Input 
                placeholder="Enter username" 
                className={isMatrix ? "matrix-input" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <label 
                className={cn(
                  "text-sm font-medium",
                  isMatrix && "text-hsl-matrix-green"
                )}
              >
                Access Code
              </label>
              <Input 
                type="password"
                placeholder="Enter access code" 
                className={isMatrix ? "matrix-input" : ""}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                className={isMatrix ? "matrix-button" : ""}
              >
                Log In
              </Button>
              <Button 
                variant={isMatrix ? "outline" : "secondary"}
                className={isMatrix ? "matrix-button bg-transparent" : ""}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Decorative Elements */}
      <div className="stagger-fade-in">
        <Card className={isMatrix ? "matrix-card" : ""}>
          <CardHeader>
            <CardTitle className={isMatrix ? "text-hsl-matrix-green matrix-glow" : ""}>
              Decorative Elements
            </CardTitle>
            <CardDescription className={isMatrix ? "text-hsl-matrix-green/70" : ""}>
              Visual styling and decorations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(
              "border rounded-lg p-4",
              isMatrix ? "matrix-border" : "border-border"
            )}>
              <p className={isMatrix ? "text-hsl-matrix-green" : ""}>
                Container with special border effects
              </p>
            </div>
            
            <div className="flex justify-center py-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                isMatrix 
                  ? "bg-hsl-matrix-dark border-2 border-hsl-matrix-green glow-pulse" 
                  : "bg-primary/10"
              )}>
                <span className={cn(
                  "font-mono font-bold text-lg",
                  isMatrix ? "text-hsl-matrix-green matrix-glow" : ""
                )}>
                  MX
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "h-12 rounded flex items-center justify-center",
                    isMatrix 
                      ? "bg-hsl-matrix-dark/70 border border-hsl-matrix-green/30" 
                      : "bg-muted"
                  )}
                >
                  <span className={isMatrix ? "text-hsl-matrix-green" : ""}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Animations */}
      <div className="stagger-fade-in">
        <Card className={isMatrix ? "matrix-card" : ""}>
          <CardHeader>
            <CardTitle className={isMatrix ? "text-hsl-matrix-green matrix-glow" : ""}>
              Animations
            </CardTitle>
            <CardDescription className={isMatrix ? "text-hsl-matrix-green/70" : ""}>
              Matrix-themed motion effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-2">
              <MatrixLoading size="md" />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-center mb-2">
                <span className={isMatrix ? "text-hsl-matrix-green/70" : "text-muted-foreground"}>
                  Matrix Rain Animation (visible in matrix theme)
                </span>
              </div>
              <div 
                className={cn(
                  "relative h-24 w-full rounded overflow-hidden",
                  isMatrix ? "bg-hsl-matrix-dark/70 border border-hsl-matrix-green/40" : "bg-muted"
                )}
              >
                {isMatrix && (
                  <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i}
                        className="matrix-rain text-hsl-matrix-green text-lg font-mono absolute"
                        style={{
                          left: `${(i * 10) + Math.random() * 5}%`,
                          top: `-${20 + Math.random() * 80}px`,
                          opacity: 0.5 + Math.random() * 0.5,
                          animationDuration: `${1 + Math.random() * 3}s`,
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      >
                        {Array.from({ length: 5 }, () => 
                          Math.random() > 0.5 ? "1" : "0"
                        ).join('')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                className={cn(
                  isMatrix && "matrix-button pulse-subtle"
                )}
              >
                <span className={isMatrix ? "glow-pulse" : ""}>
                  Pulse Effect
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 