import { Mechanic } from '../entities/Mechanic';
import { IMechanicRepository } from '../repositories/IMechanicRepository';

export class FindNearbyMechanicsUseCase {
  constructor(private readonly repo: IMechanicRepository) {}

  async execute(latitude: number, longitude: number, radiusKm = 10): Promise<Mechanic[]> {
    const mechanics = await this.repo.findNearby(latitude, longitude, radiusKm);
    return mechanics
      .filter((m) => m.status === 'available')
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
