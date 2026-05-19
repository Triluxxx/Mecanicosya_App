export type MechanicStatus = 'available' | 'busy' | 'offline';

export interface MechanicLocation {
  latitude: number;
  longitude: number;
}

export interface Mechanic {
  id: string;
  name: string;
  photo: string;
  phone: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  status: MechanicStatus;
  location: MechanicLocation;
  distanceKm: number;
  etaMinutes: number;
  pricePerHour: number;
  yearsExperience: number;
  vehicleTypes: string[];
  bio: string;
}
