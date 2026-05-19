import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceRequest, PaymentMethod } from '../../domain/entities/ServiceRequest';
import { Review } from '../../domain/entities/Review';
import { IServiceRequestRepository } from '../../domain/repositories/IServiceRequestRepository';
import { MOCK_HISTORY } from '../mock/mockData';

const STORAGE_KEY = '@mecanicosya:history';

export class ServiceRequestRepositoryImpl implements IServiceRequestRepository {
  private async load(): Promise<ServiceRequest[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_HISTORY));
    return MOCK_HISTORY;
  }

  private async save(data: ServiceRequest[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async create(request: Omit<ServiceRequest, 'id' | 'createdAt'>): Promise<ServiceRequest> {
    const history = await this.load();
    const newRequest: ServiceRequest = {
      ...request,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await this.save([newRequest, ...history]);
    return newRequest;
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    const history = await this.load();
    return history.find((r) => r.id === id) ?? null;
  }

  async getHistory(userId: string): Promise<ServiceRequest[]> {
    const history = await this.load();
    return history.filter((r) => r.userId === userId);
  }

  async updateStatus(id: string, status: ServiceRequest['status']): Promise<void> {
    const history = await this.load();
    const updated = history.map((r) =>
      r.id === id ? { ...r, status, acceptedAt: status === 'accepted' ? new Date().toISOString() : r.acceptedAt } : r
    );
    await this.save(updated);
  }

  async processPayment(id: string, method: PaymentMethod, amount: number): Promise<void> {
    const history = await this.load();
    const updated = history.map((r) =>
      r.id === id
        ? { ...r, paymentMethod: method, finalCost: amount, paymentStatus: 'paid' as const, status: 'completed' as const, completedAt: new Date().toISOString() }
        : r
    );
    await this.save(updated);
  }

  async submitReview(id: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
    const history = await this.load();
    const updated = history.map((r) =>
      r.id === id ? { ...r, rating: review.rating, review: review.comment } : r
    );
    await this.save(updated);
  }
}
