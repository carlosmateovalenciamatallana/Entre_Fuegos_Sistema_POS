// src/app/admin/comandas/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { 
  Clock, CheckCircle2, Flame, User, Utensils, 
  DollarSign, LogOut, ShieldCheck, Activity, 
  History, LayoutDashboard, TrendingUp, Users, Target, Calendar, ArrowLeft, Printer,
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. COMPONENTE IHC: TARJETA DE ORDEN CON SEMÁFORO ---
function OrderCard({ c, handleImprimirYCobrar }: { c: any, handleImprimirYCobrar: (comanda: any) => void }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const orderTime = new Date(c.createdAt).getTime();
      const differenceInMs = Date.now() - orderTime;
      setElapsedMinutes(Math.floor(differenceInMs / 60000));
    };

    calculateTime(); 
    const interval = setInterval(calculateTime, 60000); 
    return () => clearInterval(interval);
  }, [c.createdAt]);

  const total = c.items.reduce((acc: number, i: any) => acc + (i.product.price * i.quantity), 0);

  // Lógica del Semáforo 
  let statusClasses = "border-t-green-500 bg-green-950/20 shadow-green-900/20";
  let iconColor = "text-green-500";
  let TimeIcon = Clock;
  let pulse = "";

  if (elapsedMinutes >= 20) {
    statusClasses = "border-t-red-600 bg-red-950/30 shadow-red-900/30";
    iconColor = "text-red-500";
    TimeIcon = AlertTriangle;
    pulse = "animate-pulse"; 
  } else if (elapsedMinutes >= 10) {
    statusClasses = "border-t-yellow-500 bg-yellow-950/20 shadow-yellow-900/20";
    iconColor = "text-yellow-500";
  }

  return (
    <div className={`border border-neutral-800 rounded-[2.5rem] p-7 flex flex-col relative border-t-4 group transition-colors duration-500 ${statusClasses}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="bg-orange-600 text-white px-5 py-2 rounded-2xl text-2xl font-black italic shadow-lg shadow-orange-950/20">
          #{c.table.number}
        </div>
        <div className="text-right">
          <div 
            className={`flex items-center justify-end gap-1 font-bold text-sm mb-1 ${iconColor} ${pulse}`} 
            aria-label={`Tiempo de espera: ${elapsedMinutes} minutos`}
          >
            <TimeIcon size={14} />
            <span>{elapsedMinutes} min</span>
          </div>
          <p className="text-neutral-500 text-[10px] uppercase font-bold">{c.user.name}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-neutral-950/80 rounded-2xl border border-orange-500/10 flex justify-between items-center shadow-inner">
        <span className="text-neutral-600 uppercase text-[9px] font-bold">Cuenta</span>
        <span className="text-2xl font-mono text-orange-500 font-bold">${total.toLocaleString()}</span>
      </div>

      <div className="flex-1 space-y-4 mb-8 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
        {c.items.map((item: any, idx: number) => (
          <div key={idx} className="border-b border-neutral-800/40 pb-3 last:border-0">
            <p className="text-sm text-neutral-300 font-medium">
              <span className="text-orange-500 font-bold mr-2">{item.quantity}x</span> {item.product.name}
            </p>
            {item.notes && (
              <p className="text-[10px] text-orange-400/70 italic mt-1 bg-orange-500/5 p-1 px-2 rounded-lg leading-tight">
                "{item.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => handleImprimirYCobrar(c)} 
        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2"
      >
        <Printer size={16} /> IMPRIMIR Y CERRAR
      </button>
    </div>
  );
}

// --- COMPONENTE IHC 2: ITEM DE FILA DE ESPERA CON CONTADOR ---
function WaitlistItem({ w, idx, mesasLibres, handleAsignarMesa }: any) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      // Calculamos el tiempo desde que el cliente fue creado en Prisma
      const waitTime = new Date(w.createdAt).getTime();
      const differenceInMs = Date.now() - waitTime;
      setElapsedMinutes(Math.floor(differenceInMs / 60000));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [w.createdAt]);

  // Colores dinámicos para que el host sepa quién lleva demasiado tiempo esperando
  let timeColor = "text-green-500";
  if (elapsedMinutes >= 15) timeColor = "text-red-500 animate-pulse";
  else if (elapsedMinutes >= 10) timeColor = "text-yellow-500";

  return (
    <div className="bg-neutral-900/30 p-6 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-neutral-950 p-4 rounded-2xl font-black text-2xl text-neutral-600">#{idx + 1}</div>
        <div>
          <h3 className="font-bold text-lg">{w.name}</h3>
          
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-orange-500 font-bold uppercase tracking-widest">{w.partySize} Personas</p>
            {/* AQUÍ ESTÁ EL CONTADOR DE TIEMPO EN VIVO */}
            <span className={`flex items-center gap-1 text-xs font-bold ${timeColor}`} aria-label={`Esperando hace ${elapsedMinutes} minutos`}>
              <Clock size={12} /> {elapsedMinutes} min
            </span>
          </div>

        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <select 
          className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl outline-none text-sm cursor-pointer hover:border-orange-500 transition-all"
          onChange={(e) => handleAsignarMesa(w, e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Seleccionar Mesa Libre...</option>
          {mesasLibres.filter((m: any) => m.status === 'libre').map((m: any) => (
            <option key={m.id} value={m.id}>Mesa {m.number} (Soporta: {m.capacity})</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// --- 2. COMPONENTE PRINCIPAL ---
export default function AdminComandasPage() {
  const [comandas, setComandas] = useState<any[]>([]); 
  const [historialHoy, setHistorialHoy] = useState<any[]>([]); 
  const [archivoFechas, setArchivoFechas] = useState<any[]>([]); 
  const [historialPasado, setHistorialPasado] = useState<any[]>([]); 
  
  const [activeTab, setActiveTab] = useState<'vivas' | 'espera' | 'hoy' | 'archivo'>('vivas');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [ordenParaImprimir, setOrdenParaImprimir] = useState<any | null>(null);

  // --- ESTADOS PARA FILA DE ESPERA (IHC) ---
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [mesasLibres, setMesasLibres] = useState<any[]>([]);
  const [formWait, setFormWait] = useState({ name: '', partySize: 1, phone: '' });

  const router = useRouter();
  const { user, logout } = useUserStore();

  // --- CARGA DE DATOS Y WEBSOCKETS ---
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [resVivas, resHoy, resFechas, resWait, resTables] = await Promise.all([
          fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/active"),
          fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/history"),
          fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/archive-dates"),
          fetch(process.env.NEXT_PUBLIC_API_URL + "/api/waitlist"), // Nueva ruta
          fetch(process.env.NEXT_PUBLIC_API_URL + "/api/tables")    // Nueva ruta
        ]);
        if (resVivas.ok) setComandas(await resVivas.json());
        if (resHoy.ok) setHistorialHoy(await resHoy.json());
        if (resFechas.ok) setArchivoFechas(await resFechas.json());
        if (resWait.ok) setWaitlist(await resWait.json());
        if (resTables.ok) setMesasLibres(await resTables.json());
      } catch (error) {
        console.log("Error de conexión");
      }
    };
    fetchData();

    // --- CONEXIÓN EN TIEMPO REAL ---
    const socket = io(process.env.NEXT_PUBLIC_API_URL + "");
    
    socket.on("nueva_orden_creada", (nueva) => setComandas(p => [nueva, ...p]));
    
    socket.on("orden_finalizada_admin", async () => {
       const resHoy = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/history");
       if (resHoy.ok) setHistorialHoy(await resHoy.json());
    });

    socket.on("orden_actualizada_items", (actualizada) => {
      setComandas(p => p.map(c => c.id === actualizada.id ? actualizada : c));
      setHistorialHoy(p => p.map(c => c.id === actualizada.id ? actualizada : c));
    });

    socket.on("orden_eliminada_por_vacia", (data) => {
      setComandas(prevComandas => prevComandas.filter(c => c.id !== data.id)); 
      toast.info(`Mesa ${data.tableId} cancelada (Sin productos)`);
    });

    // Escuchadores de Fila de Espera y Mesas
    socket.on("estado_mesa_actualizado", (data) => {
      setMesasLibres(prev => prev.map(m => m.id === data.id ? { ...m, status: data.status } : m));
    });

    socket.on("waitlist_updated", (data) => {
      if (data.status === 'SEATED') {
        setWaitlist(p => p.filter(w => w.id !== data.id));
      } else if (data.status === 'WAITING') {
        setWaitlist(p => {
          const existe = p.find(w => w.id === data.id);
          return existe ? p : [...p, data];
        });
      }
    });

    return () => { socket.disconnect(); };
  }, [user, router]);

  // --- LÓGICA FILA DE ESPERA (IHC) ---
  const handleAgregarEspera = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formWait)
      });
      if (res.ok) {
        const nuevo = await res.json();
        setWaitlist(p => [...p.filter(w => w.id !== nuevo.id), nuevo]);
        setFormWait({ name: '', partySize: 1, phone: '' });
        toast.success("Cliente en fila de espera");
      }
    } catch (error) { toast.error("Error al registrar cliente"); }
  };

  const handleAsignarMesa = async (clienteEspera: any, tableIdStr: string) => {
    if (!tableIdStr) return;
    const mesaSeleccionada = mesasLibres.find(m => m.id === Number(tableIdStr));
    
    // VALIDADOR IHC: Prevención de error por capacidad
    if (mesaSeleccionada && mesaSeleccionada.capacity < clienteEspera.partySize) {
      toast.error(
        `Error: El grupo es de ${clienteEspera.partySize} personas, pero la Mesa ${mesaSeleccionada.number} soporta máximo ${mesaSeleccionada.capacity}.`, 
        { duration: 5000 }
      );
      return; 
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist/${clienteEspera.id}/seat`, { method: 'PATCH' });
      if (res.ok) {
        setWaitlist(p => p.filter(w => w.id !== clienteEspera.id));
        toast.success(`${clienteEspera.name} asignado a Mesa ${mesaSeleccionada.number}`);
      }
    } catch (error) { toast.error("Error al asignar mesa"); }
  };

  // --- ESTADÍSTICAS Y FUNCIONES EXISTENTES ---
  const calcularStats = (lista: any[]) => {
    const total = lista.reduce((acc, o) => acc + o.items.reduce((s:number, i:any) => s+(i.product.price*i.quantity),0), 0);
    const ventasPorMesa = lista.reduce((acc: any, o) => {
      const mesa = o.table.number;
      const totalO = o.items.reduce((s:number, i:any) => s+(i.product.price*i.quantity),0);
      acc[mesa] = (acc[mesa] || 0) + totalO;
      return acc;
    }, {});
    return { total, cantidad: lista.length, ventasPorMesa, ticket: lista.length > 0 ? total / lista.length : 0 };
  };

  const statsHoy = useMemo(() => calcularStats(historialHoy), [historialHoy]);
  const statsPasado = useMemo(() => calcularStats(historialPasado), [historialPasado]);

  const verDiaPasado = async (dateStr: string) => {
    const soloFecha = dateStr.split('T')[0];
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/history-by-date?date=${soloFecha}`);
    if (res.ok) {
      setHistorialPasado(await res.json());
      setFechaSeleccionada(soloFecha);
    }
  };

  const handleImprimirYCobrar = (comanda: any) => {
    setOrdenParaImprimir(comanda);
    setTimeout(() => {
      window.print();
      handleCompletarOrden(comanda.id, comanda.table.number);
      setOrdenParaImprimir(null);
    }, 500);
  };

  const handleCompletarOrden = async (orderId: number, tableNumber: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/complete`, { method: 'PATCH' });
      if (res.ok) {
        setComandas(p => p.filter(c => c.id !== orderId));
        toast.success(`Mesa ${tableNumber} finalizada y cobrada.`);
      }
    } catch (error) { toast.error("Error al cerrar orden"); }
  };

  let totalConsumo = 0, baseImpoconsumo = 0, valorImpoconsumo = 0, propina = 0, totalConPropina = 0;
  if (ordenParaImprimir) {
    totalConsumo = ordenParaImprimir.items.reduce((acc: number, i: any) => acc + (i.product.price * i.quantity), 0);
    baseImpoconsumo = totalConsumo / 1.08; 
    valorImpoconsumo = totalConsumo - baseImpoconsumo; 
    propina = totalConsumo * 0.10; 
    totalConPropina = totalConsumo + propina;
  }

  const formatoMoneda = (num: number) => Math.round(num).toLocaleString('es-CO');
  const formatoMonedaDec = (num: number) => num.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-light selection:bg-orange-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 border-b border-neutral-900 pb-8 gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-600/10 rounded-[2rem] border border-orange-600/20">
            <Flame className="text-orange-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">ENTRE <span className="text-orange-500">FUEGOS</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800 text-[9px] text-orange-500 font-bold uppercase tracking-widest">
                <ShieldCheck size={10} /> Admin
              </span>
              <span className="text-neutral-500 text-xs italic">Sesión de <span className="text-neutral-200 font-bold not-italic">{user?.name}</span></span>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex bg-neutral-900/50 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-md w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'vivas', label: 'EN VIVO', icon: <LayoutDashboard size={14} /> },
            { id: 'espera', label: 'FILA ESPERA', icon: <Users size={14} /> },
            { id: 'hoy', label: 'VENTAS HOY', icon: <TrendingUp size={14} /> },
            { id: 'archivo', label: 'ARCHIVO', icon: <History size={14} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 lg:flex-none flex whitespace-nowrap items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold transition-all duration-500 ${activeTab === tab.id ? "bg-orange-600 text-white shadow-xl shadow-orange-900/20" : "text-neutral-500 hover:text-white"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button onClick={() => { logout(); router.push("/"); }} className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 text-neutral-500 hover:text-red-500 transition-all">
          <LogOut size={20} />
        </button>
      </header>

      {/* TICKET INVISIBLE (SIN CAMBIOS) */}
      {ordenParaImprimir && (
        <div id="ticket-impresion" style={{ width: '76mm', padding: '0', background: 'white', color: 'black', fontFamily: 'monospace', fontSize: '11px', margin: '0', lineHeight: '1.2' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0' }}>ENTRE FUEGOS GOURMET</h2>
            <p style={{ margin: '0' }}>YULY VIVIANA LOPEZ</p>
            <p style={{ margin: '0' }}>Nit: 42150101-1</p>
            <p style={{ margin: '0' }}>CALLE 61A 24-07</p>
            <p style={{ margin: '0' }}>Telefono: 3205110144</p>
            <br />
            <p style={{ margin: '0' }}>NO VALIDO COMO FACTURA!</p>
            <p style={{ margin: '0' }}>MODO INFORMATIVO DE SU CONSUMO</p>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0' }}>Fecha de Venta: {new Date().toLocaleString('es-CO')}</p>
            <p style={{ margin: '0', fontSize: '9px' }}>RESPONSABLE IMPUESTO DE IVA / IMPOCONSUMO</p>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>Mesa : M{ordenParaImprimir.table.number}</h3>
            <p style={{ margin: '0', fontSize: '13px', fontWeight: 'bold' }}>Mesero: {ordenParaImprimir.user.name.toUpperCase()}</p>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '2px 0', marginBottom: '4px' }}>
              <span style={{ width: '55%' }}>| Descripcion</span>
              <span style={{ width: '20%', textAlign: 'center' }}>| Cant |</span>
              <span style={{ width: '25%', textAlign: 'right' }}>Valor |</span>
            </div>
            {ordenParaImprimir.items.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', marginBottom: '2px' }}>
                <span style={{ width: '55%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>|{item.product.name.toUpperCase()}</span>
                <span style={{ width: '20%', textAlign: 'center' }}>{item.quantity}</span>
                <span style={{ width: '25%', textAlign: 'right' }}>{formatoMoneda(item.quantity * item.product.price)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed black', marginTop: '4px' }}></div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>**TOTAL CONSUMO&gt;&gt;</span><span>${formatoMoneda(totalConsumo)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>**TOTAL DESCUENTO&gt;&gt;</span><span>$0</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>**SUB TOTAL&gt;&gt;</span><span>${formatoMoneda(totalConsumo)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>**IMPTOS I/O CONSUMO&gt;&gt;</span><span>${formatoMoneda(valorImpoconsumo)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}><span>**TOTAL A PAGAR&gt;</span><span>${formatoMoneda(totalConsumo)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>**PAGA CON&gt;&gt;</span><span>${formatoMoneda(totalConsumo)}</span></div>
          </div>
          <div style={{ borderTop: '1px solid black', paddingTop: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
              <span>**TOTAL A PAGAR<br/>CON PROPINA&gt;&gt;</span>
              <span style={{ display: 'flex', alignItems: 'flex-end' }}>${formatoMoneda(totalConPropina)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '6px' }}>
              <span>PROPINA VOLUNTARIA 10%</span>
              <span>${formatoMoneda(propina)}</span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* --- PESTAÑA: COMANDAS VIVAS --- */}
        {activeTab === 'vivas' && (
          <motion.div key="vivas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comandas.map((c) => (
              <OrderCard key={c.id} c={c} handleImprimirYCobrar={handleImprimirYCobrar} />
            ))}
            {comandas.length === 0 && <div className="col-span-full py-40 text-center text-neutral-800 uppercase tracking-widest">Sin pedidos activos</div>}
          </motion.div>
        )}

        {/* --- NUEVA PESTAÑA: FILA DE ESPERA (IHC) --- */}
        {activeTab === 'espera' && (
          <motion.div key="espera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulario de Registro */}
            <div className="bg-neutral-900/40 p-8 rounded-[2.5rem] border border-neutral-800 h-fit">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-orange-500"/> Nuevo Cliente</h2>
              <form onSubmit={handleAgregarEspera} className="space-y-4">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase font-bold">Nombre</label>
                  <input required value={formWait.name} onChange={e => setFormWait({...formWait, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl mt-1 outline-none focus:border-orange-500" placeholder="Ej: Familia García" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase font-bold">Personas</label>
                    <input required type="number" min="1" value={formWait.partySize} onChange={e => setFormWait({...formWait, partySize: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl mt-1 outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 uppercase font-bold">Teléfono</label>
                    <input value={formWait.phone} onChange={e => setFormWait({...formWait, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl mt-1 outline-none focus:border-orange-500" placeholder="Opcional" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-orange-500 transition-all">AÑADIR A LA FILA</button>
              </form>
            </div>

            {/* Lista Interactiva CON CONTADOR */}
            <div className="lg:col-span-2 space-y-4">
              {waitlist.length === 0 ? (
                <div className="p-20 text-center text-neutral-600 border border-dashed border-neutral-800 rounded-[2.5rem]">No hay clientes en fila de espera.</div>
              ) : (
                waitlist.map((w, idx) => (
                  <WaitlistItem 
                    key={w.id} 
                    w={w} 
                    idx={idx} 
                    mesasLibres={mesasLibres} 
                    handleAsignarMesa={handleAsignarMesa} 
                  />
                ))
              )}
            </div>

          </motion.div>
        )}

        {/* --- PESTAÑA: VENTAS HOY --- */}
        {activeTab === 'hoy' && (
          <motion.div key="hoy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Venta Bruta Hoy", val: `$${statsHoy.total.toLocaleString()}`, icon: <TrendingUp className="text-orange-500" /> },
                { label: "Ticket Promedio", val: `$${statsHoy.ticket.toLocaleString(undefined, {maximumFractionDigits:0})}`, icon: <Target className="text-blue-500" /> },
                { label: "Servicios", val: statsHoy.cantidad, icon: <CheckCircle2 className="text-green-500" /> },
                { label: "Sincronización", val: "En Línea", icon: <Activity className="text-purple-500 animate-pulse" /> }
              ].map((kpi, i) => (
                <div key={i} className="bg-neutral-900/40 p-6 rounded-[2.5rem] border border-neutral-900 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">{kpi.icon}</div>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">{kpi.label}</p>
                  <h2 className="text-3xl font-mono font-bold">{kpi.val}</h2>
                </div>
              ))}
            </div>
            <div className="bg-neutral-900/30 rounded-[3rem] border border-neutral-900 p-8 shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-500 mb-8 flex items-center gap-2"><LayoutDashboard size={16} className="text-orange-500" /> Rendimiento por Mesa</h3>
              <div className="space-y-6">
                {Object.keys(statsHoy.ventasPorMesa).map((mesa) => {
                  const porcentaje = (statsHoy.ventasPorMesa[mesa] / statsHoy.total) * 100;
                  return (
                    <div key={mesa} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold"><span className="text-neutral-400">MESA {mesa}</span><span className="text-orange-500 font-mono">${statsHoy.ventasPorMesa[mesa].toLocaleString()}</span></div>
                      <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-900">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${porcentaje}%` }} className="h-full bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PESTAÑA: ARCHIVO HISTÓRICO --- */}
        {activeTab === 'archivo' && (
          <motion.div key="archivo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {!fechaSeleccionada ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {archivoFechas.map((f, i) => (
                  <button 
                    key={i} 
                    onClick={() => verDiaPasado(f.date)}
                    className="bg-neutral-900 p-6 rounded-[2.5rem] border border-neutral-800 hover:border-orange-500 transition-all text-center group"
                  >
                    <Calendar className="mx-auto mb-3 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-tighter">{new Date(f.date).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <button onClick={() => setFechaSeleccionada(null)} className="flex items-center gap-2 text-orange-500 text-[10px] font-bold uppercase tracking-widest hover:gap-4 transition-all">
                  <ArrowLeft size={16} /> Volver al archivo
                </button>
                <div className="bg-orange-600/10 p-10 rounded-[3rem] border border-orange-600/20 shadow-2xl">
                  <h2 className="text-neutral-400 text-[10px] uppercase tracking-widest mb-4">Dashboard del Día: <span className="text-white">{fechaSeleccionada}</span></h2>
                  <div className="flex gap-16">
                    <div><p className="text-5xl font-mono font-bold text-white">${statsPasado.total.toLocaleString()}</p><p className="text-[10px] text-neutral-500 uppercase font-bold mt-2">Venta Bruta</p></div>
                    <div><p className="text-5xl font-mono font-bold text-white">{statsPasado.cantidad}</p><p className="text-[10px] text-neutral-500 uppercase font-bold mt-2">Mesas Atendidas</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {historialPasado.map(o => (
                     <div key={o.id} className="bg-neutral-900/30 p-5 rounded-3xl border border-neutral-800 flex justify-between items-center group">
                        <div><p className="font-bold text-neutral-200">MESA {o.table.number}</p><p className="text-[10px] text-neutral-600 uppercase italic">{o.user.name}</p></div>
                        <p className="font-mono text-orange-500 font-bold">${o.items.reduce((a:number, i:any) => a+(i.product.price*i.quantity),0).toLocaleString()}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}