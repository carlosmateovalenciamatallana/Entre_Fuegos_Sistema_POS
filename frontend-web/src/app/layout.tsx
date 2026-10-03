import type { Metadata } from "next";
import { Inter } from "next/font/google";

// @ts-ignore: Next.js procesa el CSS en compilación, silenciamos el falso positivo de TypeScript
import "./globals.css";

import { Toaster } from "sonner";
// Importamos el proveedor creado en el Paso 3
import { ThemeProvider } from "@/components/ThemeProvider"; 
// Importamos el botón creado en el Paso 4
import { ThemeToggle } from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Entre Fuegos",
  description: "Sistema de pedidos para el restaurante Entre Fuegos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300`} 
  suppressHydrationWarning>
        
        {/* Envolvemos a los hijos y al Toaster con el ThemeProvider */}
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
          
          {/* Inyectamos el botón flotante para que esté en todas las vistas */}
          <ThemeToggle />
        </ThemeProvider>
        
      </body>
    </html>
  );
}