import { Moon, Sun, Code, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/App";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "h-9 w-9", 
            theme === "matrix" && "text-hsl-matrix-green matrix-glow",
            theme === "nsfw" && "text-red-500"
          )}
        >
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "matrix" && (
            <div className="animate-pulse-subtle">
              <Code className="h-[1.2rem] w-[1.2rem]" />
            </div>
          )}
          {theme === "nsfw" && (
            <div className="animate-pulse-subtle">
              <EyeOff className="h-[1.2rem] w-[1.2rem]" />
            </div>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("matrix")}
          className="text-hsl-matrix-green matrix-glow" 
        >
          <Code className="mr-2 h-4 w-4" />
          <span>Matrix</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("nsfw")}
          className="text-red-500" 
        >
          <EyeOff className="mr-2 h-4 w-4" />
          <span>NSFW Mode</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 