import { create } from 'zustand';
import { User, UserRole, UserPlan } from '../data/local/Database';
import * as DB from '../data/local/Database';
import { ApiClient } from '../data/remote/ApiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMechanic: boolean;

  // Acciones
  initialize: () => Promise<void>;
  login: (phone: string, code: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  sendOTP: (phone: string) => Promise<string>;
  register: (data: { phone: string; role: UserRole; name: string; vehicle?: string; plan?: UserPlan }) => Promise<void>;
  registerMechanic: (data: {
    name: string;
    ruc: string;
    specialties: string[];
    yearsExperience: string;
    pricePerHour: string;
    bio: string;
    vehicleTypes: string[];
    hasTowingVehicle: boolean;
    towingPlate?: string;
    plan?: UserPlan;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  syncBackendId: (location?: { lat: number; lng: number }) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isMechanic: false,

  initialize: async () => {
    try {
      const savedUser = await DB.getCurrentUser();
      if (savedUser) {
        set({
          user: savedUser,
          isAuthenticated: true,
          isMechanic: savedUser.role === 'mechanic',
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
      set({ isLoading: false });
    }
  },

  sendOTP: async (phone: string) => {
    const code = await DB.generateOTP(phone);
    return code;
  },

  login: async (phone: string, code: string) => {
    const isValid = await DB.verifyOTP(phone, code);
    if (!isValid) return { success: false, isNewUser: false };

    let user = await DB.findUserByPhone(phone);
    const isNewUser = !user;

    if (!user) {
      // New user - needs registration
      return { success: true, isNewUser: true };
    }

    // Existing user - log in
    await DB.saveCurrentUser(user);
    set({
      user,
      isAuthenticated: true,
      isMechanic: user.role === 'mechanic',
    });
    return { success: true, isNewUser: false };
  },

  register: async (data) => {
    const user = await DB.createUser(data);
    await DB.saveCurrentUser(user);
    set({
      user,
      isAuthenticated: true,
      isMechanic: user.role === 'mechanic',
    });
  },

  registerMechanic: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = await DB.updateUser(current.id, {
      name: data.name,
      ruc: data.ruc,
      verified: data.ruc.trim().length > 0,
      specialties: data.specialties,
      yearsExperience: parseInt(data.yearsExperience) || 0,
      pricePerHour: parseInt(data.pricePerHour) || 0,
      bio: data.bio,
      vehicleTypes: data.vehicleTypes,
      hasTowingVehicle: data.hasTowingVehicle,
      towingPlate: data.hasTowingVehicle ? (data.towingPlate ?? '') : '',
      plan: data.hasTowingVehicle ? (data.plan ?? 'basic') : 'basic',
    });
    if (updated) {
      await DB.saveCurrentUser(updated);
      set({ user: updated });
    }
  },

  logout: async () => {
    await DB.logout();
    set({ user: null, isAuthenticated: false, isMechanic: false });
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = await DB.updateUser(current.id, updates);
    if (updated) {
      await DB.saveCurrentUser(updated);
      set({ user: updated });
    }
  },

  refreshUser: async () => {
    const current = get().user;
    if (!current) return;
    const fresh = await DB.findUserById(current.id);
    if (fresh) {
      await DB.saveCurrentUser(fresh);
      set({ user: fresh, isMechanic: fresh.role === 'mechanic' });
    }
  },

  // Registra (o reutiliza) el usuario en el backend real y guarda su id ahí.
  // Si el backend no está disponible, falla en silencio y devuelve null.
  syncBackendId: async (location) => {
    const current = get().user;
    if (!current) return null;
    if (current.backendId) return current.backendId;
    try {
      const isMechanic = current.role === 'mechanic';
      const { user: apiUser } = await ApiClient.authDemo({
        role: isMechanic ? 'mechanic' : 'driver',
        name: current.name,
        phone: current.phone,
        location,
        plan: current.plan,
        ...(isMechanic && {
          specialties: current.specialties,
          vehicleTypes: current.vehicleTypes,
          ruc: current.ruc,
          pricePerHour: current.pricePerHour,
          yearsExperience: current.yearsExperience,
          bio: current.bio,
          hasTowingVehicle: current.hasTowingVehicle,
          towingPlate: current.towingPlate,
        }),
      });
      const updated = await DB.updateUser(current.id, { backendId: apiUser.id });
      if (updated) {
        await DB.saveCurrentUser(updated);
        set({ user: updated });
      }
      return apiUser.id;
    } catch (e) {
      console.warn('No se pudo sincronizar con el backend real:', e);
      return null;
    }
  },
}));
