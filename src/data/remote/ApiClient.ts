const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
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
  status: 'searching' | 'assigned' | 'accepted' | 'rejected' | 'on_way' | 'completed' | 'cancelled';
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

  authDemo: (data: { role: 'driver' | 'mechanic'; name?: string; phone?: string; location?: ApiLocation }) =>
    request<{ token: string; user: ApiUser }>('/auth/demo', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createSos: (data: { driverId: string; serviceTypeId?: string; address?: string; location: ApiLocation }) =>
    request<{ sos: ApiSos; match: ApiSosMatch | null }>('/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSosList: () => request<ApiSos[]>('/sos'),

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
};
