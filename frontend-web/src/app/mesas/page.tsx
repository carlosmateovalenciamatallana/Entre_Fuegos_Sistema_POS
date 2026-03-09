"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { LogOut, Utensils, Bell, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MesasScreen() {
  const [mesas, setMesas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const { user, logout } = useUserStore();
  const router = useRouter();

  const cargarMesas = async () => {
    try {
      // USAMOS TU IP REAL PARA LA CONEXIÓN
      const respuesta = await fetch("http://192.168.1.9:3000/api/tables", { cache: 'no-store' });
      const datos = await respuesta.json();
      setMesas(datos);
      setCargando(false);
    } catch (error) {
      console.error("Error al conectar:", error);
    }
  };

  useEffect(() => {
    cargarMesas();
    const intervalo = setInterval(cargarMesas, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  const getEstilosMesa = (status: string) => {
    switch (status) {
      case "libre": return "bg-green-500 border-green-700 text-white hover:bg-green-400";
      case "ocupada": return "bg-orange-500 border-orange-700 text-white hover:bg-orange-400";
      case "atencion": return "bg-yellow-400 border-yellow-600 text-neutral-900 hover:bg-yellow-300";
      default: return "bg-neutral-500 border-neutral-700 text-white";
    }
  };

  if (cargando) return (
    <div className="h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={50} />
      <p className="text-xl font-bold italic">Preparando el salón de Entre Fuegos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-100 font-sans flex flex-col">
      <header className="flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-neutral-200 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">🔥</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Entre Fuegos</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right leading-tight">
            <p className="text-xs text-neutral-500 italic">
                {user?.role === "ADMIN" ? "Administrador" : "Mesero"}
            </p>
            <p className="font-bold text-neutral-800">{user?.name || "Sesión activa"}</p>
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="text-neutral-400 hover:text-red-500 transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex justify-center items-center bg-neutral-200">
        <div className="relative w-full max-w-[1200px] h-[750px] bg-[url('https://img.pikbest.com/wp/202408/rustic-vintage-vertical-wooden-texture-background-a-and-feel_9909667.jpg!bw700')] bg-cover bg-center rounded-xl shadow-2xl border-8 border-neutral-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />

          {mesas.map((mesa) => (
            <motion.button
              key={mesa.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{ top: `${mesa.y}%`, left: `${mesa.x}%`, transform: 'translate(-50%, -50%)', position: 'absolute' }}
              className={`flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] shadow-2xl transition-all z-10 ${getEstilosMesa(mesa.status)}`}
            >
              <span className="text-[10px] font-bold uppercase opacity-80">Mesa</span>
              <span className="text-3xl font-black">{mesa.number}</span>
              <div className="mt-1 flex flex-col items-center">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
                  {mesa.status === "libre" ? <Utensils size={12}/> : <Bell size={12}/>}
                  {mesa.status}
                </div>
                <div className="flex items-center gap-1 text-[9px] opacity-90 font-bold">
                  <Users size={10} /> {mesa.capacity} px
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}