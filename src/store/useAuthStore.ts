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
  login: (
    phone: string,
    code: string,
    expectedRole?: UserRole
  ) => Promise<{ success: boolean; isNewUser: boolean; roleMismatch?: boolean; existingRole?: UserRole }>;
  sendOTP: (phone: string) => Promise<string>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
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

  login: async (phone: string, code: string, expectedRole?: UserRole) => {
    const isValid = await DB.verifyOTP(phone, code);
    if (!isValid) return { success: false, isNewUser: false };

    const user = await DB.findUserByPhone(phone);

    if (!user) {
      // New user - needs registration
      return { success: true, isNewUser: true };
    }

    // El número ya tiene cuenta, pero de otro rol del que se pidió crear
    // (ej. se intenta "Crear cuenta Mecánico" con un número que ya es Cliente).
    // No lo logueamos en la cuenta equivocada en silencio.
    if (expectedRole && user.role !== expectedRole) {
      return { success: false, isNewUser: false, roleMismatch: true, existingRole: user.role };
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

  // Login de demo instantáneo: crea (o reutiliza) una cuenta de prueba ya completa,
  // sin pedir datos al usuario, para que cualquiera pueda probar la app de una.
  quickDemoLogin: async (role: UserRole) => {
    const phone = role === 'mechanic' ? '+51 987011111' : '+51 900000001';
    let user = await DB.findUserByPhone(phone);
    if (!user) {
      user = await DB.createUser({
        phone,
        role,
        name: role === 'mechanic' ? 'Mecánico Demo' : 'Cliente Demo',
        vehicle: role === 'client' ? 'Honda CB 190R 2024' : '',
        plan: 'free',
        ...(role === 'mechanic' && {
          specialties: ['Motor 4T', 'Frenos', 'Llantas'],
          vehicleTypes: ['Todos los tipos'],
          pricePerHour: 30,
          yearsExperience: 5,
          bio: 'Cuenta de demostración para probar la app.',
          status: 'online' as const,
        }),
      });
    }
    await DB.saveCurrentUser(user);
    set({
      user,
      isAuthenticated: true,
      isMechanic: user.role === 'mechanic',
    });
  },

  register: async (data) => {
    const user = await DB.createUser(data);
    if (data.role === 'mechanic') {
      // Todavía falta completar especialidades/precio/bio en MechanicRegisterScreen.
      // No autenticamos aún: si lo hiciéramos, AppNavigator saltaría directo al
      // dashboard de mecánico y la pantalla de datos nunca se mostraría.
      set({ user });
      return;
    }
    await DB.saveCurrentUser(user);
    set({
      user,
      isAuthenticated: true,
      isMechanic: false,
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
      set({ user: updated, isAuthenticated: true, isMechanic: true });
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
