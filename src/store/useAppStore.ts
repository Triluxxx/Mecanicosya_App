import { create } from 'zustand';
import { Mechanic } from '../domain/entities/Mechanic';
import { ServiceRequest } from '../domain/entities/ServiceRequest';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  vehicle: string;
  totalServices: number;
}

interface AppState {
  user: User;
  activeRequest: ServiceRequest | null;
  nearbyMechanics: Mechanic[];
  history: ServiceRequest[];
  isSearching: boolean;

  setActiveRequest: (req: ServiceRequest | null) => void;
  setNearbyMechanics: (mechanics: Mechanic[]) => void;
  setHistory: (history: ServiceRequest[]) => void;
  setSearching: (v: boolean) => void;
  addToHistory: (req: ServiceRequest) => void;
  updateHistoryItem: (id: string, updates: Partial<ServiceRequest>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'user1',
    name: 'Sergio López',
    phone: '+591 70099999',
    email: 'sergio@email.com',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    vehicle: 'Toyota Corolla 2018',
    totalServices: 3,
  },
  activeRequest: null,
  nearbyMechanics: [],
  history: [],
  isSearching: false,

  setActiveRequest: (req) => set({ activeRequest: req }),
  setNearbyMechanics: (mechanics) => set({ nearbyMechanics: mechanics }),
  setHistory: (history) => set({ history }),
  setSearching: (v) => set({ isSearching: v }),
  addToHistory: (req) => set((s) => ({ history: [req, ...s.history] })),
  updateHistoryItem: (id, updates) =>
    set((s) => ({
      history: s.history.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      activeRequest: s.activeRequest?.id === id ? { ...s.activeRequest, ...updates } : s.activeRequest,
    })),
}));
