"use client"; // Obligatorio: Le dice a Next.js que este componente usa estado del navegador

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Definimos las propiedades que aceptará nuestro proveedor
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false} 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}