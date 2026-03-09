import { create } from 'zustand';

// Definimos qué datos vamos a guardar del usuario
interface User {
  id: number;
  name: string;
  role: string;
}

interface UserStore {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Creamos la "memoria" global
export const useUserStore = create<UserStore>((set) => ({
  user: null,
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}));