"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { setTheme, resolvedTheme } = useTheme();

  if (!mounted) {
    return (
      <Button variant="outline" aria-label="Toggle theme" className="h-9 w-9">
        <span className="h-4 w-4 inline-block" />
      </Button>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <Button variant="outline" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
