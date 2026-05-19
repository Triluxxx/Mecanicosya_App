import { Mechanic } from '../entities/Mechanic';

export interface IMechanicRepository {
  findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Mechanic[]>;
  findById(id: string): Promise<Mechanic | null>;
  getAll(): Promise<Mechanic[]>;
}
