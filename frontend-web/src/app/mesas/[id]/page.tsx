// src/app/mesas/[id]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore"; 
import { 
  ShoppingCart, ArrowLeft, Send, UtensilsCrossed, MessageSquare, 
  Plus, X, Edit3, Trash2, CheckCircle, AlertTriangle, Info 
} from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function TomaPedidosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mesaId } = use(params); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';

  const { items, addItem, removeItem, getTotal, clearOrder } = useOrderStore();
  const user = useUserStore((state) => state.user); 

  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("Todos");

  // Estados para productos nuevos
  const [productoParaNota, setProductoParaNota] = useState<Product | null>(null);
  const [notaTemporal, setNotaTemporal] = useState("");

  // --- ESTADOS PARA GESTIÓN DE ORDEN EXISTENTE ---
  const [ordenIdExistente, setOrdenIdExistente] = useState<number | null>(null);
  const [itemsYaPedidos, setItemsYaPedidos] = useState<any[]>([]);

  // --- NUEVO ESTADO: CONTROL DE VISTA MÓVIL ---
  const [verComandaMovil, setVerComandaMovil] = useState(false);

  // Estados para Modales
  const [itemParaEliminar, setItemParaEliminar] = useState<any>(null);
  const [itemParaEditarNota, setItemParaEditarNota] = useState<any>(null);
  const [notaEditadaTemporal, setNotaEditadaTemporal] = useState("");

  // 1. EFECTO: CARGAR DATOS INICIALES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMenu = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products");
        const menuData = await resMenu.json();
        setProductos(menuData);

        if (isEdit) {
          const resOrden = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/table/${mesaId}`);
          const ordenData = await resOrden.json();
          if (ordenData) {
            setOrdenIdExistente(ordenData.id);
            setItemsYaPedidos(ordenData.items);
          }
        }
        setCargando(false);
      } catch (error) {
        toast.error("Error al cargar datos del sistema.");
        setCargando(false);
      }
    };
    fetchData();
  }, [mesaId, isEdit]);

  // --- 2. NUEVO EFECTO IHC: ESCUCHADOR DE COCINA EN TIEMPO REAL ---
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL + "");
    socket.on("item_cook_status_updated", (data) => {
      if (data.cookStatus === 'LISTO' && data.order.userId === user?.id) {
        toast.success(
          `¡ATENCIÓN! ${data.product.name} de la MESA ${data.order.table.number} está LISTO en cocina.`, 
          { duration: 8000 } 
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // --- ACCIONES BACKEND ---
  const ejecutarEliminacion = async () => {
    if (!itemParaEliminar) return;
    try {
      const toastId = toast.loading("Eliminando...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order-items/${itemParaEliminar.id}`, { method: 'DELETE' });
      
      if (res.ok) {
        const data = await res.json();
        if (data.mesaLiberada) {
          toast.success("Mesa vaciada y liberada", { id: toastId });
          setItemParaEliminar(null);
          clearOrder();
          router.push("/mesas"); 
        } else {
          setItemsYaPedidos(prev => prev.filter(i => i.id !== itemParaEliminar.id));
          toast.success("Producto eliminado", { id: toastId });
          setItemParaEliminar(null);
        }
      } else {
        toast.error("Error al intentar eliminar", { id: toastId });
      }
    } catch (error) { 
      toast.error("Error de red al eliminar"); 
    }
  };

  const guardarNotaEditada = async () => {
    if (!itemParaEditarNota) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order-items/${itemParaEditarNota.id}/notes`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notaEditadaTemporal })
      });
      if (res.ok) {
        setItemsYaPedidos(prev => prev.map(i => i.id === itemParaEditarNota.id ? { ...i, notes: notaEditadaTemporal } : i));
        toast.success("Nota actualizada");
        setItemParaEditarNota(null);
      }
    } catch (error) { toast.error("Error al actualizar la nota."); }
  };

  // --- ACCIONES FRONTEND ---
  const prepararProducto = (prod: Product) => {
    setProductoParaNota(prod);
    setNotaTemporal(""); 
  };

  const confirmarProductoConNota = () => {
    if (productoParaNota) {
      addItem({ productId: productoParaNota.id, name: productoParaNota.name, price: productoParaNota.price, notes: notaTemporal });
      setProductoParaNota(null);
      setNotaTemporal("");
    }
  };

  const handleEnviarOrden = async () => {
    if (items.length === 0) return toast.error("No hay productos por enviar.");
    try {
      const toastId = toast.loading(isEdit ? "Actualizando..." : "Enviando a cocina...");
      const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${ordenIdExistente}/add-items` : `${process.env.NEXT_PUBLIC_API_URL}/api/orders`;
      
      const respuesta = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: parseInt(mesaId), userId: user?.id, items: items })
      });

      if (respuesta.ok) {
        toast.success(`Pedido procesado con éxito`, { id: toastId });
        clearOrder();
        router.push("/mesas"); 
      }
    } catch (error) { toast.error("Error de conexión."); }
  };

  const categorias = ["Todos", ...Array.from(new Set(productos.map((p) => p.category)))];
  const productosFiltrados = categoriaActiva === "Todos" ? productos : productos.filter((p) => p.category === categoriaActiva);

  return (
    // AQUÍ INICIA LA MAGIA DE COLORES: bg-neutral-50 para claro, dark:bg-neutral-950 para oscuro
    <div className="h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-light flex flex-col md:flex-row overflow-hidden relative transition-colors duration-300">
      
      {/* --- SECCIÓN IZQUIERDA: MENÚ --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:border-r border-neutral-200 dark:border-neutral-900">
        <div className="p-6 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { clearOrder(); router.push("/mesas"); }} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-90">
                <ArrowLeft size={24} className="text-orange-500" />
              </button>
              <h1 className="text-3xl font-light">Mesa <span className="text-orange-500 font-bold">{mesaId}</span></h1>
            </div>
            {isEdit && (
              <div className="hidden md:flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full text-orange-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <Edit3 size={12} /> Editando
              </div>
            )}
          </div>

          <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-2 flex-shrink-0">
            {categorias.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategoriaActiva(cat)} 
                className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all border ${
                  categoriaActiva === cat 
                    ? "bg-orange-600 border-orange-500 text-white" 
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar pb-24">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-full text-orange-500/50 animate-pulse font-mono uppercase tracking-widest">Cargando menú...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosFiltrados.map((prod) => (
                <div key={prod.id} onClick={() => prepararProducto(prod)} className="bg-white dark:bg-neutral-900/40 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 cursor-pointer transition-all hover:shadow-md dark:hover:border-neutral-700 group flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-orange-500/80 uppercase tracking-widest mb-1">{prod.category}</p>
                      <h3 className="text-lg mb-4 text-neutral-800 dark:text-neutral-200 leading-tight">{prod.name}</h3>
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-full"><Plus size={16} className="text-orange-500" /></div>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 font-mono font-medium">${prod.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- BOTÓN FLOTANTE (SOLO MÓVIL) --- */}
      <button 
        onClick={() => setVerComandaMovil(true)}
        className="md:hidden fixed bottom-6 right-6 bg-orange-600 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] z-40 flex items-center justify-center active:scale-90 transition-transform"
      >
        <ShoppingCart size={24} />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-orange-600 font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-orange-600">
            {items.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        )}
      </button>

      {/* --- SECCIÓN DERECHA: COMANDA --- */}
      <div className={`
        fixed inset-0 z-50 md:static md:z-20
        w-full md:w-[420px] 
        bg-white md:bg-white/50 dark:bg-neutral-950 dark:md:bg-neutral-900/50 flex flex-col h-full shadow-2xl md:border-l border-neutral-200 dark:border-neutral-900
        transition-transform duration-300 ease-in-out
        ${verComandaMovil ? "translate-y-0" : "translate-y-full md:translate-y-0"}
      `}>
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md flex justify-between items-center">
          <h2 className="text-2xl font-light flex items-center gap-3 text-neutral-900 dark:text-white">
            <ShoppingCart size={22} className="text-orange-500" /> Comanda Actual
          </h2>
          <button onClick={() => setVerComandaMovil(false)} className="md:hidden p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32 md:pb-6">
          
          {/* HISTORIAL (SI ES EDICIÓN) */}
          {isEdit && itemsYaPedidos.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle size={12} className="text-green-500" /> Ya en Cocina
              </p>
              <div className="space-y-3">
                {itemsYaPedidos.map((item) => (
                  <div key={item.id} className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <div className="flex-1 opacity-80 dark:opacity-60">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.quantity}x {item.product.name}</p>
                      {item.notes && <p className="text-[11px] text-orange-600 dark:text-orange-400 italic mt-1"><MessageSquare size={10} className="inline mr-1"/>{item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setItemParaEditarNota(item); setNotaEditadaTemporal(item.notes || ""); }} className="p-2 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"><Edit3 size={14} /></button>
                      <button onClick={() => setItemParaEliminar(item)} className="p-2 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-500 dark:hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NUEVOS PRODUCTOS */}
          <div>
            {items.length > 0 && <p className="text-[10px] text-orange-500 uppercase tracking-widest mb-4">Por Enviar</p>}
            <div className="space-y-4">
              {items.length === 0 && !isEdit && (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-700 opacity-80 dark:opacity-40">
                   <UtensilsCrossed size={48} className="mb-4" />
                   <p className="text-sm italic">Sin productos</p>
                </div>
              )}
              {items.map((item) => (
                <div key={`${item.productId}-${item.notes}`} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-orange-500/30 shadow-lg shadow-neutral-200 dark:shadow-none">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                      {item.notes && <p className="text-[11px] text-orange-600 dark:text-orange-500 italic mt-1.5 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 p-1 px-2 rounded-lg"><MessageSquare size={10} /> {item.notes}</p>}
                    </div>
                    <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button onClick={() => removeItem(item.productId, item.notes)} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800">-</button>
                    <span className="text-sm font-mono w-4 text-center text-neutral-800 dark:text-neutral-200">{item.quantity}</span>
                    <button onClick={() => addItem({ ...item })} className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER DE PAGO */}
        <div className="absolute bottom-0 left-0 right-0 md:static p-6 bg-white/90 dark:bg-neutral-950/90 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-6">
            <span className="text-neutral-500 text-[10px] uppercase tracking-widest">{isEdit ? "Total Adicional" : "Total Cuenta"}</span>
            <span className="font-mono text-3xl font-light text-orange-600 dark:text-orange-500">${getTotal().toLocaleString()}</span>
          </div>
          <button onClick={handleEnviarOrden} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-[2rem] flex items-center justify-center gap-3 font-bold shadow-xl shadow-orange-500/20 active:scale-95 uppercase tracking-widest text-xs transition-colors">
            <Send size={18} /> {isEdit ? "Actualizar Cuenta" : "Enviar a cocina"}
          </button>
        </div>
      </div>

      {/* --- MODAL 1: NOTAS PARA PRODUCTOS NUEVOS --- */}
      {productoParaNota && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
            <h2 className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Instrucciones</h2>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-6">{productoParaNota.name}</p>
            <textarea autoFocus value={notaTemporal} onChange={(e) => setNotaTemporal(e.target.value)} placeholder="Ej: Término medio, sin cebolla..." className="w-full h-32 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 text-neutral-900 dark:text-white focus:border-orange-500 outline-none resize-none mb-8 text-sm placeholder:text-neutral-400" />
            <div className="flex gap-4">
              <button onClick={() => setProductoParaNota(null)} className="flex-1 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Cancelar</button>
              <button onClick={confirmarProductoConNota} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-colors">Añadir</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDITAR NOTA EXISTENTE --- */}
      {itemParaEditarNota && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-orange-500" />
              <h2 className="text-xs text-neutral-500 uppercase tracking-widest">Actualizar Nota</h2>
            </div>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-500 mb-6">{itemParaEditarNota.product.name}</p>
            <textarea autoFocus value={notaEditadaTemporal} onChange={(e) => setNotaEditadaTemporal(e.target.value)} className="w-full h-32 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 text-neutral-900 dark:text-white focus:border-orange-500 outline-none resize-none mb-8 text-sm" />
            <div className="flex gap-4">
              <button onClick={() => setItemParaEditarNota(null)} className="flex-1 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Descartar</button>
              <button onClick={guardarNotaEditada} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CONFIRMACIÓN ELIMINACIÓN --- */}
      {itemParaEliminar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 dark:bg-black/95 backdrop-blur-md">
          <div className="bg-white dark:bg-neutral-900 border border-red-500/20 w-full max-w-[360px] rounded-[3rem] p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-500/20">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">¿Eliminar Plato?</h2>
            <p className="text-neutral-500 text-sm mb-10 italic">
              Vas a remover <span className="text-neutral-800 dark:text-neutral-200 font-bold">"{itemParaEliminar.product.name}"</span> de la cuenta.
            </p>
            <div className="flex flex-col gap-4">
              <button onClick={ejecutarEliminacion} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-colors">Confirmar</button>
              <button onClick={() => setItemParaEliminar(null)} className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}