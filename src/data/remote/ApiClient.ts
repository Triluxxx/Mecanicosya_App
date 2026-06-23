import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL_KEY = '@mecanicosya:apiUrl';

let baseUrl = DEFAULT_BASE_URL;
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  const stored = await AsyncStorage.getItem(API_URL_KEY);
  if (stored) baseUrl = stored;
}

export function getApiUrl(): string {
  return baseUrl;
}

export function getDefaultApiUrl(): string {
  return DEFAULT_BASE_URL;
}

export async function setApiUrl(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/+$/, '');
  baseUrl = trimmed || DEFAULT_BASE_URL;
  loaded = true;
  if (trimmed) {
    await AsyncStorage.setItem(API_URL_KEY, trimmed);
  } else {
    await AsyncStorage.removeItem(API_URL_KEY);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  await ensureLoaded();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || `Error ${res.status} en ${path}`);
  return body as T;
}

// ─── Tipos de la API (contrato real del backend) ───
export interface ApiLocation {
  lat: number;
  lng: number;
}

export interface ApiUser {
  id: string;
  role: 'driver' | 'mechanic';
  name: string;
  phone: string;
  plan: 'free' | 'basic' | 'premium' | 'expert';
  verified: boolean;
  badge: string | null;
  plate: string | null;
  logoUrl: string | null;
  photoUrl: string | null;
  location: ApiLocation | null;
  available: boolean;
  specialties: string[];
  vehicleTypes: string[];
  ruc: string | null;
  pricePerHour: number;
  yearsExperience: number;
  bio: string | null;
  rating: number;
  totalReviews: number;
  hasTowingVehicle: boolean;
  towingPlate: string | null;
  createdAt: string;
}

export interface ApiPart {
  id: string;
  mechanicId: string;
  name: string;
  category: 'llanta' | 'camara' | 'cadena' | 'aceite' | 'frenos' | 'otro';
  price: number;
  stock: number;
  photoUrl: string | null;
  description: string | null;
  createdAt: string;
}

export interface ApiReview {
  id: string;
  sosId: string;
  mechanicId: string;
  driverId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ApiServiceType {
  id: string;
  name: string;
  basePrice: number;
}

export interface ApiSosMatch {
  id: string;
  name: string;
  photoUrl: string | null;
  logoUrl: string | null;
  plate: string | null;
  verified: boolean;
  badge: string | null;
  distanceKm: number | null;
  plan: ApiUser['plan'];
}

export interface ApiSos {
  id: string;
  driverId: string;
  serviceTypeId: string | null;
  address: string;
  location: ApiLocation;
  status: 'searching' | 'assigned' | 'accepted' | 'rejected' | 'on_way' | 'in_progress' | 'completed' | 'cancelled';
  mechanicId: string | null;
  mechanicDistanceKm: number | null;
  confirmationMethod: string;
  createdAt: string;
}

// ─── Endpoints ───
export const ApiClient = {
  health: () => request<{ ok: boolean; app: string; db: string }>('/health'),

  getServiceTypes: () => request<ApiServiceType[]>('/service-types'),

  getMechanics: () => request<ApiUser[]>('/mechanics'),

  authDemo: (data: {
    role: 'driver' | 'mechanic';
    name?: string;
    phone?: string;
    location?: ApiLocation;
    plan?: ApiUser['plan'];
    specialties?: string[];
    vehicleTypes?: string[];
    ruc?: string;
    pricePerHour?: number;
    yearsExperience?: number;
    bio?: string;
    hasTowingVehicle?: boolean;
    towingPlate?: string;
  }) =>
    request<{ token: string; user: ApiUser }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createSos: (data: { driverId: string; serviceTypeId?: string; address?: string; location: ApiLocation; mechanicId?: string }) =>
    request<{ sos: ApiSos; match: ApiSosMatch | null }>('/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSosList: (mechanicId?: string) =>
    request<ApiSos[]>(mechanicId ? `/sos?mechanicId=${encodeURIComponent(mechanicId)}` : '/sos'),

  setMechanicAvailability: (id: string, available: boolean) =>
    request<ApiUser>(`/mechanics/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    }),

  updateSosStatus: (id: string, status: ApiSos['status'], note?: string) =>
    request<ApiSos>(`/sos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  createPaymentIntent: (data: { amount: number; currency?: string }) =>
    request<{ clientSecret: string; paymentIntentId: string }>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createPayment: (data: {
    sosId?: string;
    userId: string;
    amount: number;
    method: 'yape_plin_qr' | string;
    concept?: string;
    qrPayload?: string;
  }) =>
    request<{ payment: unknown; mechanicScreen: { color: string; message: string } }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createSubscription: (data: { userId: string; plan: 'premium' | 'expert' }) =>
    request<{ id: string; userId: string; plan: string; price: number; status: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMechanicProfile: (
    id: string,
    data: { logoUrl?: string; photoUrl?: string; plate?: string; verified?: boolean; badge?: string; location?: ApiLocation }
  ) =>
    request<ApiSosMatch>(`/mechanics/${id}/profile`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  diagnosticsWhatsapp: (data: { phone: string; message?: string }) =>
    request<{ whatsappUrl: string }>('/diagnostics/whatsapp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getParts: (category?: string) =>
    request<ApiPart[]>(category ? `/parts?category=${encodeURIComponent(category)}` : '/parts'),

  getMechanicParts: (mechanicId: string) =>
    request<ApiPart[]>(`/mechanics/${mechanicId}/parts`),

  createPart: (data: {
    mechanicId: string;
    name: string;
    category: ApiPart['category'];
    price: number;
    stock: number;
    photoUrl?: string;
    description?: string;
  }) =>
    request<ApiPart>('/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createReview: (data: { sosId: string; mechanicId: string; driverId: string; rating: number; comment?: string }) =>
    request<ApiReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMechanicReviews: (mechanicId: string) =>
    request<ApiReview[]>(`/mechanics/${mechanicId}/reviews`),
};
