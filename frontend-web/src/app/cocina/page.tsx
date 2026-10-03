"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { ChefHat, Undo2, Check, Clock, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- COMPONENTE IHC: ITEM CON VALIDADOR DE PREVENCIÓN DE ERROR (UNDO) ---
function ItemCocina({ item, orderTable, orderId, onRemoveItem }: any) {
  const [status, setStatus] = useState(item.cookStatus);
  const [countdown, setCountdown] = useState(5);
  const [timerId, setTimerId] = useState<any>(null);
  const [intervalId, setIntervalId] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerId, intervalId]);

  const updateBackendStatus = async (newStatus: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order-items/${item.id}/cook-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookStatus: newStatus })
      });
    } catch (e) { console.error("Error updating status"); }
  };

  const handleTap = () => {
    if (status === 'PENDIENTE') {
      setStatus('PREPARANDO');
      updateBackendStatus('PREPARANDO');
    } else if (status === 'PREPARANDO') {
      setStatus('UNDO_PHASE');
      setCountdown(5);
      const iId = setInterval(() => setCountdown(c => c - 1), 1000);
      setIntervalId(iId);
      const tId = setTimeout(() => {
        clearInterval(iId);
        updateBackendStatus('LISTO');
        onRemoveItem(orderId, item.id);
        toast.success(`Mesero notificado: ${item.product.name} de Mesa ${orderTable} listo.`);
      }, 5000);
      setTimerId(tId);
    }
  };

  const handleUndo = (e: any) => {
    e.stopPropagation(); 
    clearTimeout(timerId);
    clearInterval(intervalId);
    setStatus('PREPARANDO'); 
    toast.info("Acción deshecha. El plato sigue en preparación.");
  };

  if (status === 'UNDO_PHASE') {
    return (
      <div className="bg-red-50 dark:bg-red-500/20 border border-red-400 dark:border-red-500 p-4 rounded-2xl flex justify-between items-center transition-all">
        <div className="text-red-600 dark:text-red-400 font-bold">
          <p className="text-sm line-through decoration-red-500">{item.quantity}x {item.product.name}</p>
          <p className="text-[10px] uppercase">Despachando en {countdown}s...</p>
        </div>
        <button onClick={handleUndo} className="bg-red-600 text-white p-3 rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-red-500 active:scale-95 shadow-lg">
          <Undo2 size={16} /> DESHACER
        </button>
      </div>
    );
  }

  const isPreparing = status === 'PREPARANDO';
  return (
    <div onClick={handleTap} className={`p-4 rounded-2xl border cursor-pointer select-none transition-all active:scale-95 ${isPreparing ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-400 dark:border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm dark:shadow-none'}`}>
      <div className="flex justify-between items-start gap-4">
        <h4 className={`font-bold text-lg ${isPreparing ? 'text-yellow-600 dark:text-yellow-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
          <span className="mr-2">{item.quantity}x</span> {item.product.name}
        </h4>
        {isPreparing && <div className="bg-yellow-500 text-white dark:text-neutral-950 p-1.5 rounded-lg"><ChefHat size={16} /></div>}
      </div>
      {item.notes && <p className={`text-sm mt-2 font-medium italic ${isPreparing ? 'text-yellow-600 dark:text-yellow-400/80' : 'text-orange-600 dark:text-orange-400/80'}`}>📍 Nota: "{item.notes}"</p>}
    </div>
  );
}

// --- VISTA PRINCIPAL KDS ---
export default function CocinaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user, logout } = useUserStore();
  const router = useRouter();

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kitchen/orders`);
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!user || (user.role !== 'COCINA' && user.role !== 'ADMIN')) {
      router.push("/");
      return;
    }
    fetchKitchenOrders();
    const socket = io(process.env.NEXT_PUBLIC_API_URL + "");
    socket.on("nueva_orden_creada", fetchKitchenOrders);
    socket.on("orden_actualizada_items", fetchKitchenOrders);
    socket.on("orden_eliminada_por_vacia", fetchKitchenOrders);
    return () => { socket.disconnect(); };
  }, [user, router]);

  const handleRemoveItemLocally = (orderId: number, itemId: number) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === orderId) {
          const remainingItems = order.items.filter((i: any) => i.id !== itemId);
          return { ...order, items: remainingItems };
        }
        return order;
      }).filter(order => order.items.length > 0); 
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white p-6 md:p-10 selection:bg-yellow-500/30 transition-colors duration-500">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-200 dark:border-neutral-900 pb-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-500/10 rounded-3xl border border-yellow-200 dark:border-yellow-500/20"><ChefHat className="text-yellow-500" size={36} /></div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">KDS <span className="text-yellow-500">COCINA</span></h1>
            <p className="text-neutral-500 text-xs uppercase font-bold tracking-widest mt-1">Pantalla de Despacho en Vivo - {user?.name}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 text-sm font-bold border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
            <Clock size={16} className="animate-pulse text-green-500" /> Sincronizado
          </div>
          <button onClick={() => { logout(); router.push("/"); }} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-500 transition-all shadow-sm dark:shadow-none">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((o) => (
            <motion.div key={o.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-neutral-900/40 border-t-4 border-t-yellow-500 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 shadow-xl dark:shadow-2xl transition-colors">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-neutral-100 dark:bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors">
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white">Mesa {o.table.number}</h2>
                </div>
                <span className="text-neutral-500 text-[10px] font-bold uppercase text-right leading-tight">
                  Pedido por:<br/><span className="text-neutral-800 dark:text-neutral-300">{o.user.name}</span>
                </span>
              </div>
              <div className="space-y-3">
                {o.items.map((item: any) => (
                  <ItemCocina key={item.id} item={item} orderTable={o.table.number} orderId={o.id} onRemoveItem={handleRemoveItemLocally} />
                ))}
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <ChefHat size={64} className="mx-auto text-neutral-300 dark:text-neutral-800 mb-6" />
              <p className="text-neutral-500 dark:text-neutral-600 text-xl font-bold uppercase tracking-widest">Cocina libre. No hay pedidos pendientes.</p>
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}