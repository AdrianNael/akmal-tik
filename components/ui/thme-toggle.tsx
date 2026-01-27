"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        id="theme-toggle"
      />
      <label
        htmlFor="theme-toggle"
        className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out text-gray-400"
      >
        {isDark ? "Dark" : "Light"}
      </label>
    </div>
  );
}
