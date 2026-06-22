import { Mechanic, MechanicPlan } from '../../domain/entities/Mechanic';
import { IMechanicRepository } from '../../domain/repositories/IMechanicRepository';
import { ApiClient, ApiUser } from '../remote/ApiClient';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Number((2 * R * Math.asin(Math.sqrt(h))).toFixed(2));
}

function toDomainMechanic(u: ApiUser, fromLocation?: { lat: number; lng: number }): Mechanic {
  const plan: MechanicPlan = u.plan === 'expert' ? 'expert' : 'basic';
  const distanceKm = fromLocation && u.location ? haversineKm(fromLocation, u.location) : 0;

  return {
    id: u.id,
    name: u.name,
    photo: u.photoUrl || '',
    phone: u.phone,
    rating: u.rating ?? 5,
    totalReviews: u.totalReviews ?? 0,
    specialties: u.specialties ?? [],
    status: u.available ? 'available' : 'offline',
    location: { latitude: u.location?.lat ?? 0, longitude: u.location?.lng ?? 0 },
    distanceKm,
    etaMinutes: Math.max(5, Math.round(distanceKm * 4)),
    pricePerHour: u.pricePerHour ?? 0,
    yearsExperience: u.yearsExperience ?? 0,
    vehicleTypes: u.vehicleTypes ?? [],
    bio: u.bio ?? '',
    plan,
    hasTowingVehicle: u.hasTowingVehicle ?? Boolean(u.plate),
    towingPlate: u.towingPlate ?? u.plate ?? undefined,
    badge: u.badge ?? undefined,
  };
}

export class MechanicRepositoryRemoteImpl implements IMechanicRepository {
  async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Mechanic[]> {
    const mechanics = await ApiClient.getMechanics();
    return mechanics
      .map((m) => toDomainMechanic(m, { lat: latitude, lng: longitude }))
      .filter((m) => m.distanceKm <= radiusKm);
  }

  async findById(id: string): Promise<Mechanic | null> {
    const mechanics = await ApiClient.getMechanics();
    const found = mechanics.find((m) => m.id === id);
    return found ? toDomainMechanic(found) : null;
  }

  async getAll(): Promise<Mechanic[]> {
    const mechanics = await ApiClient.getMechanics();
    return mechanics.map((m) => toDomainMechanic(m));
  }
}
