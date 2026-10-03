"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect solo se ejecuta en el cliente, esto evita errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // No renderizamos nada hasta que el cliente cargue

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      // Clases Tailwind: Botón flotante abajo a la izquierda, con sombras y transiciones
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-lg hover:scale-110 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
      aria-label="Alternar modo de color"
      title="Cambiar tema"
    >
      {theme === "dark" ? (
        // Icono de Sol para pasar a Modo Claro
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        // Icono de Luna para pasar a Modo Oscuro
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
}