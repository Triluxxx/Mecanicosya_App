import { ServiceRequest, PaymentMethod } from '../entities/ServiceRequest';
import { Review } from '../entities/Review';

export interface IServiceRequestRepository {
  create(request: Omit<ServiceRequest, 'id' | 'createdAt'>): Promise<ServiceRequest>;
  findById(id: string): Promise<ServiceRequest | null>;
  getHistory(userId: string): Promise<ServiceRequest[]>;
  updateStatus(id: string, status: ServiceRequest['status']): Promise<void>;
  processPayment(id: string, method: PaymentMethod, amount: number): Promise<void>;
  submitReview(id: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<void>;
}
