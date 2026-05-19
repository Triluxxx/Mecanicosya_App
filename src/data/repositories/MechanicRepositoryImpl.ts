import { Mechanic } from '../../domain/entities/Mechanic';
import { IMechanicRepository } from '../../domain/repositories/IMechanicRepository';
import { MOCK_MECHANICS } from '../mock/mockData';

export class MechanicRepositoryImpl implements IMechanicRepository {
  async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Mechanic[]> {
    await new Promise((r) => setTimeout(r, 1500));
    return MOCK_MECHANICS.filter((m) => m.distanceKm <= radiusKm);
  }

  async findById(id: string): Promise<Mechanic | null> {
    return MOCK_MECHANICS.find((m) => m.id === id) ?? null;
  }

  async getAll(): Promise<Mechanic[]> {
    return MOCK_MECHANICS;
  }
}
