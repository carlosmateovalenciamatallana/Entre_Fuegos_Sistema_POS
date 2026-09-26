"use client";
import { useState, useEffect } from "react"; // Añadimos useEffect
import { Delete, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "../store/userStore";

import "./globals.css"; 

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useUserStore();
  const [pin, setPin] = useState("");
  const [cargando, setCargando] = useState(false);
  
  // NUEVO: Estado para las chispas para evitar el error de Hydration
  const [chispas, setChispas] = useState<{top: string, left: string, duration: string}[]>([]);

  // NUEVO: Generamos las posiciones solo una vez que el componente monta en el cliente
  useEffect(() => {
    const nuevasChispas = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${3 + Math.random() * 2}s`
    }));
    setChispas(nuevasChispas);
  }, []);


  
const validarPin = async (pinAValidar: string) => {
  try {
    setCargando(true);
    const respuesta = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinAValidar })
    });
    const data = await respuesta.json();

    if (respuesta.ok) {
      toast.success(data.mensaje);
      login(data.usuario); 

      // --- LÓGICA DE REDIRECCIÓN POR ROL ---
      if (data.usuario.role === 'ADMIN') {
        router.push('/admin/comandas'); // Redirige al panel de administrador
      } else {
        router.push('/mesas'); // Redirige al mapa de mesas para meseros
      }
      
    } else {
      toast.error(data.error);
      setPin(""); 
    }
  } catch (error) {
    toast.error("Error de conexión");
    setPin("");
  } finally {
    setCargando(false);
  }
};

  const handlePress = (num: string) => {
    if (pin.length < 4 && !cargando) {
      const nuevoPin = pin + num;
      setPin(nuevoPin);
      if (nuevoPin.length === 4) validarPin(nuevoPin);
    }
  };

  const handleDelete = () => { if (!cargando) setPin(pin.slice(0, -1)); };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. EFECTO DE RESPLANDOR (Fuego de fondo) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.15)_0%,_transparent_75%)] pointer-events-none" />
      
      {/* 2. LOGO/TÍTULO ESTILO PREMIUM */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-extralight tracking-[0.2em] mb-2 text-orange-100/90">
          ENTRE <span className="font-semibold text-orange-500">FUEGOS</span>
        </h1>
        <p className="text-neutral-500 tracking-[0.4em] text-xs uppercase font-light">
          Ingresa tu PIN de acceso
        </p>
      </motion.div>

      {/* 3. INDICADORES DE PIN (TAMAÑO GRANDE) */}
      <div className="flex justify-center gap-10 mb-20 z-10 w-full">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: pin.length > i ? 1.3 : 1,
            }}
            className={`w-6 h-6 rounded-full border-2 border-neutral-700 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.4)] ${
              pin.length > i ? 'bg-orange-500 border-orange-500 shadow-orange-500/60' : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* 4. TECLADO NUMÉRICO (CENTRADO Y PROPORCIONAL) */}
      <div className="z-10 w-full max-w-[340px] md:max-w-[400px]">
        <div className="grid grid-cols-3 gap-y-8 gap-x-8 justify-items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(38, 38, 38, 0.6)" }}
              whileTap={{ scale: 0.95, backgroundColor: "#f97316", boxShadow: "0 0 30px rgba(249,115,22,0.6)" }}
              onClick={() => handlePress(num.toString())}
              disabled={cargando}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-neutral-800 bg-neutral-900/40 text-3xl md:text-4xl font-light flex items-center justify-center transition-all text-neutral-300 hover:border-orange-500/40"
            >
              {num}
            </motion.button>
          ))}
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-neutral-600 hover:text-red-400 transition-colors"
          >
            <Delete size={36} strokeWidth={1} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(38, 38, 38, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePress("0")}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-neutral-800 bg-neutral-900/40 text-3xl md:text-4xl font-light flex items-center justify-center text-neutral-300"
          >
            0
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => pin.length === 4 && validarPin(pin)}
            disabled={pin.length !== 4 || cargando}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border transition-all ${
              pin.length === 4 
              ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.5)]" 
              : "bg-neutral-900/40 border-neutral-800 text-neutral-800"
            }`}
          >
            <ArrowRight size={36} strokeWidth={1} />
          </motion.button>
        </div>
      </div>

      {/* 5. DECORACIÓN DE CHISPAS (CORREGIDA) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {chispas.map((chispa, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-orange-500 rounded-full animate-pulse"
            style={{
              top: chispa.top,
              left: chispa.left,
              animationDuration: chispa.duration
            }}
          />
        ))}
      </div>
    </div>
  );
}