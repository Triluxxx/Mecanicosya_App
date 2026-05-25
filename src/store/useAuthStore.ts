import { create } from 'zustand';
import { User, UserRole } from '../data/local/Database';
import * as DB from '../data/local/Database';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMechanic: boolean;

  // Acciones
  initialize: () => Promise<void>;
  login: (phone: string, code: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  sendOTP: (phone: string) => Promise<string>;
  register: (data: { phone: string; role: UserRole; name: string; vehicle?: string }) => Promise<void>;
  registerMechanic: (data: {
    name: string;
    ruc: string;
    specialties: string[];
    yearsExperience: string;
    pricePerHour: string;
    bio: string;
    vehicleTypes: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isMechanic: false,

  initialize: async () => {
    try {
      await DB.seedDemoMechanics();
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
}));
