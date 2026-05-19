import { ServiceRequest } from '../entities/ServiceRequest';
import { IServiceRequestRepository } from '../repositories/IServiceRequestRepository';

interface CreateRequestInput {
  userId: string;
  mechanicId: string;
  mechanicName: string;
  mechanicPhoto: string;
  problemDescription: string;
  userLocation: { latitude: number; longitude: number };
  userAddress: string;
  estimatedCost: number;
}

export class CreateServiceRequestUseCase {
  constructor(private readonly repo: IServiceRequestRepository) {}

  async execute(input: CreateRequestInput): Promise<ServiceRequest> {
    return this.repo.create({
      ...input,
      status: 'pending',
      paymentStatus: 'pending',
    });
  }
}
