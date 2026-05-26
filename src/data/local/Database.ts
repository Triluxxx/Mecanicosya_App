import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Tipos ───
export type UserRole = 'client' | 'mechanic';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
  email: string;
  photo: string;
  vehicle: string;            // cliente: modelo de moto
  ruc: string;                // mecánico: RUC opcional
  verified: boolean;          // insignia verificada (tiene RUC)
  specialties: string[];      // mecánico
  yearsExperience: number;    // mecánico
  pricePerHour: number;       // mecánico
  bio: string;                // mecánico
  vehicleTypes: string[];     // mecánico: tipos de moto que atiende
  latitude: number;           // mecánico: ubicación
  longitude: number;
  status: 'online' | 'offline' | 'busy';
  rating: number;
  totalReviews: number;
  totalServices: number;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  mechanicId: string;
  mechanicName: string;
  mechanicPhoto: string;
  status: 'pending' | 'accepted' | 'in_route' | 'in_progress' | 'completed' | 'cancelled';
  problemDescription: string;
  userLocation: { latitude: number; longitude: number };
  userAddress: string;
  estimatedCost: number;
  finalCost?: number;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  rating?: number;
  review?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Base de datos local (AsyncStorage) ───
const KEYS = {
  USERS: '@mecanicosya:users',
  REQUESTS: '@mecanicosya:requests',
  CURRENT_USER: '@mecanicosya:currentUser',
  OTP_CODES: '@mecanicosya:otpCodes',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ─── Usuarios ───
async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.phone === phone) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(data: Partial<User> & { phone: string; role: UserRole; name: string }): Promise<User> {
  const users = await getUsers();
  const now = new Date().toISOString();
  const newUser: User = {
    id: generateId(),
    phone: data.phone,
    role: data.role,
    name: data.name,
    email: data.email ?? '',
    photo: data.photo ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=FF6B35&color=fff&size=200`,
    vehicle: data.vehicle ?? '',
    ruc: data.ruc ?? '',
    verified: !!(data.ruc && data.ruc.trim().length > 0),
    specialties: data.specialties ?? [],
    yearsExperience: data.yearsExperience ?? 0,
    pricePerHour: data.pricePerHour ?? 0,
    bio: data.bio ?? '',
    vehicleTypes: data.vehicleTypes ?? [],
    latitude: data.latitude ?? -6.4888,
    longitude: data.longitude ?? -76.3603,
    status: data.role === 'mechanic' ? 'offline' : 'online',
    rating: data.rating ?? 5.0,
    totalReviews: data.totalReviews ?? 0,
    totalServices: data.totalServices ?? 0,
    createdAt: now,
  };
  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

export async function getMechanics(): Promise<User[]> {
  const users = await getUsers();
  return users.filter((u) => u.role === 'mechanic');
}

export async function getAvailableMechanics(): Promise<User[]> {
  const users = await getUsers();
  return users.filter((u) => u.role === 'mechanic' && u.status === 'online');
}

// ─── Solicitudes ───
async function getRequests(): Promise<ServiceRequest[]> {
  const raw = await AsyncStorage.getItem(KEYS.REQUESTS);
  return raw ? JSON.parse(raw) : [];
}

async function saveRequests(requests: ServiceRequest[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
}

export async function createRequest(data: Omit<ServiceRequest, 'id' | 'createdAt'>): Promise<ServiceRequest> {
  const requests = await getRequests();
  const newReq: ServiceRequest = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newReq);
  await saveRequests(requests);
  return newReq;
}

export async function getHistory(userId: string): Promise<ServiceRequest[]> {
  const requests = await getRequests();
  return requests
    .filter((r) => r.userId === userId || r.mechanicId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRequestById(id: string): Promise<ServiceRequest | null> {
  const requests = await getRequests();
  return requests.find((r) => r.id === id) ?? null;
}

export async function updateRequest(id: string, updates: Partial<ServiceRequest>): Promise<void> {
  const requests = await getRequests();
  const updated = requests.map((r) => (r.id === id ? { ...r, ...updates } : r));
  await saveRequests(updated);
}

export async function getPendingRequestsForMechanic(mechanicId: string): Promise<ServiceRequest[]> {
  const requests = await getRequests();
  return requests.filter((r) => r.mechanicId === mechanicId && r.status === 'pending');
}

// ─── OTP (mock - muestra código en pantalla) ───
export async function generateOTP(phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otpData = { phone, code, expiresAt: Date.now() + 5 * 60 * 1000 };
  await AsyncStorage.setItem(KEYS.OTP_CODES, JSON.stringify(otpData));
  return code;
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEYS.OTP_CODES);
  if (!raw) return false;
  const otpData = JSON.parse(raw);
  if (otpData.phone !== phone) return false;
  if (Date.now() > otpData.expiresAt) return false;
  return otpData.code === code;
}

// ─── Sesión ───
export async function saveCurrentUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER);
}

// ─── Datos iniciales (mecánicos demo) ───
export async function seedDemoMechanics(): Promise<void> {
  const users = await getUsers();
  const hasMechanics = users.some((u) => u.role === 'mechanic');
  if (hasMechanics) return;

  const demoMechanics: Partial<User>[] = [
    {
      phone: '+591 70011111',
      role: 'mechanic',
      name: 'Carlos Mendoza',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      ruc: '12345678901234',
      verified: true,
      specialties: ['Motor', 'Transmisión', 'Frenos'],
      yearsExperience: 12,
      pricePerHour: 80,
      bio: 'Mecánico certificado de motos con más de 12 años de experiencia. Especialista en motos deportivas y touring.',
      vehicleTypes: ['Deportiva', 'Touring', 'Naked', 'Custom'],
      latitude: -6.4888,
      longitude: -76.3603,
      status: 'online',
      rating: 4.9,
      totalReviews: 127,
      totalServices: 0,
    },
    {
      phone: '+591 70022222',
      role: 'mechanic',
      name: 'Roberto Flores',
      photo: 'https://randomuser.me/api/portraits/men/45.jpg',
      ruc: '',
      verified: false,
      specialties: ['Electricidad', 'Diagnóstico', 'Inyección'],
      yearsExperience: 8,
      pricePerHour: 70,
      bio: 'Especialista en sistemas eléctricos de motos. Diagnóstico con scanner profesional.',
      vehicleTypes: ['Deportiva', 'Scooter', 'Enduro', 'Naked'],
      latitude: -6.4920,
      longitude: -76.3590,
      status: 'online',
      rating: 4.7,
      totalReviews: 89,
      totalServices: 0,
    },
    {
      phone: '+591 70033333',
      role: 'mechanic',
      name: 'Miguel Quispe',
      photo: 'https://randomuser.me/api/portraits/men/58.jpg',
      ruc: '98765432109876',
      verified: true,
      specialties: ['Llantas', 'Suspensión', 'Alineación', 'Cadena'],
      yearsExperience: 15,
      pricePerHour: 65,
      bio: 'El más experimentado en suspensión y transmisión de motos. Atiendo todo tipo de motocicletas.',
      vehicleTypes: ['Todos los tipos', 'Enduro', 'Custom', 'Scooter', 'Naked'],
      latitude: -6.4870,
      longitude: -76.3545,
      status: 'online',
      rating: 4.8,
      totalReviews: 203,
      totalServices: 0,
    },
    {
      phone: '+591 70044444',
      role: 'mechanic',
      name: 'Andrés Torrico',
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      ruc: '',
      verified: false,
      specialties: ['Motor 2T', 'Carburador', 'Cambio de aceite'],
      yearsExperience: 5,
      pricePerHour: 55,
      bio: 'Joven mecánico especializado en motos de baja cilindrada. Puntual y responsable.',
      vehicleTypes: ['Scooter', 'Naked', 'Custom', 'Enduro'],
      latitude: -6.4940,
      longitude: -76.3610,
      status: 'online',
      rating: 4.5,
      totalReviews: 54,
      totalServices: 0,
    },
    {
      phone: '+591 70055555',
      role: 'mechanic',
      name: 'Jorge Vargas',
      photo: 'https://randomuser.me/api/portraits/men/71.jpg',
      ruc: '45678901234567',
      verified: true,
      specialties: ['Motor 4T', 'Inyección electrónica', 'Reprogramación'],
      yearsExperience: 18,
      pricePerHour: 95,
      bio: 'Especialista en motos de alta gama y competición. Diagnóstico y reprogramación de centralitas.',
      vehicleTypes: ['Deportiva', 'Touring', 'Naked'],
      latitude: -6.4850,
      longitude: -76.3530,
      status: 'online',
      rating: 4.6,
      totalReviews: 142,
      totalServices: 0,
    },
  ];

  // Create demo mechanics
  const now = new Date().toISOString();
  for (const m of demoMechanics) {
    users.push({
      id: generateId(),
      phone: m.phone!,
      role: m.role!,
      name: m.name!,
      email: '',
      photo: m.photo!,
      vehicle: '',
      ruc: m.ruc!,
      verified: m.verified!,
      specialties: m.specialties!,
      yearsExperience: m.yearsExperience!,
      pricePerHour: m.pricePerHour!,
      bio: m.bio!,
      vehicleTypes: m.vehicleTypes!,
      latitude: m.latitude!,
      longitude: m.longitude!,
      status: m.status as 'online',
      rating: m.rating!,
      totalReviews: m.totalReviews!,
      totalServices: 0,
      createdAt: now,
    });
  }
  await saveUsers(users);
}
