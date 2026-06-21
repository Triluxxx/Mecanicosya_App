import { Part, PartCategory } from '../../domain/entities/Part';
import { IPartRepository } from '../../domain/repositories/IPartRepository';
import { MOCK_PARTS } from '../mock/mockData';

export class PartRepositoryImpl implements IPartRepository {
  async getAll(): Promise<Part[]> {
    return MOCK_PARTS;
  }

  async findByCategory(category: PartCategory): Promise<Part[]> {
    return MOCK_PARTS.filter((p) => p.category === category);
  }

  async findByMechanic(mechanicId: string): Promise<Part[]> {
    return MOCK_PARTS.filter((p) => p.mechanicId === mechanicId);
  }

  async findById(id: string): Promise<Part | null> {
    return MOCK_PARTS.find((p) => p.id === id) ?? null;
  }
}
