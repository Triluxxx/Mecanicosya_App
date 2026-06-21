import { Part, PartCategory } from '../entities/Part';

export interface IPartRepository {
  getAll(): Promise<Part[]>;
  findByCategory(category: PartCategory): Promise<Part[]>;
  findByMechanic(mechanicId: string): Promise<Part[]>;
  findById(id: string): Promise<Part | null>;
}
