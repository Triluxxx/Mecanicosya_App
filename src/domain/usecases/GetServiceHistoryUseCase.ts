import { ServiceRequest } from '../entities/ServiceRequest';
import { IServiceRequestRepository } from '../repositories/IServiceRequestRepository';

export class GetServiceHistoryUseCase {
  constructor(private readonly repo: IServiceRequestRepository) {}

  async execute(userId: string): Promise<ServiceRequest[]> {
    const history = await this.repo.getHistory(userId);
    return history.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
