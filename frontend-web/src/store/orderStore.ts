// src/store/orderStore.ts
import { create } from 'zustand';

// Definimos la estructura de un ítem en la orden
export interface OrderItemInput {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface OrderStore {
  items: OrderItemInput[];
  addItem: (item: Omit<OrderItemInput, 'quantity'>) => void;
  // removeItem ahora requiere las notas para identificar exactamente qué variante eliminar
  removeItem: (productId: number, notes?: string) => void; 
  updateNotes: (productId: number, notes: string) => void;
  clearOrder: () => void;
  getTotal: () => number;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  items: [],
  
  addItem: (newItem) => set((state) => {
    // BUSQUEDA CRÍTICA: Buscamos un producto que coincida en ID Y en la NOTA exacta
    const existing = state.items.find(
      i => i.productId === newItem.productId && i.notes === newItem.notes
    );

    if (existing) {
      // Si existe la combinación exacta, sumamos a la cantidad
      return {
        items: state.items.map(i => 
          (i.productId === newItem.productId && i.notes === newItem.notes)
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      };
    }
    // Si la nota es diferente o el producto es nuevo, se crea una nueva línea en la comanda
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),

  removeItem: (productId, notes) => set((state) => {
    // Identificamos el producto específico por ID y Nota
    const existing = state.items.find(
      i => i.productId === productId && i.notes === notes
    );

    if (existing && existing.quantity > 1) {
      // Si hay más de uno, restamos uno a la cantidad
      return {
        items: state.items.map(i => 
          (i.productId === productId && i.notes === notes)
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        )
      };
    }
    // Si solo queda uno, eliminamos la línea completa de la comanda
    return { 
      items: state.items.filter(i => !(i.productId === productId && i.notes === notes)) 
    };
  }),

  updateNotes: (productId, notes) => set((state) => ({
    // Permite actualizar la nota de un producto existente por su ID
    items: state.items.map(i => 
      i.productId === productId ? { ...i, notes } : i
    )
  })),
  
  clearOrder: () => set({ items: [] }),
  
  getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));