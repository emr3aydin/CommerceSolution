"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
