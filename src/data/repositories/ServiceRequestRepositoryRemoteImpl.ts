import { ServiceRequest, PaymentMethod, RequestStatus } from '../../domain/entities/ServiceRequest';
import { Review } from '../../domain/entities/Review';
import { IServiceRequestRepository } from '../../domain/repositories/IServiceRequestRepository';
import { ApiClient, ApiSos } from '../remote/ApiClient';

// El backend modela esto como "SOS", no como "ServiceRequest": no guarda
// mechanicName/mechanicPhoto/estimatedCost/finalCost/paymentStatus/review.
// Se completa lo que no existe todavía en el contrato con valores por defecto.
const STATUS_FROM_API: Record<ApiSos['status'], RequestStatus> = {
  searching: 'pending',
  assigned: 'pending',
  accepted: 'accepted',
  rejected: 'cancelled',
  on_way: 'in_route',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_TO_API: Record<RequestStatus, ApiSos['status']> = {
  pending: 'assigned',
  accepted: 'accepted',
  in_route: 'on_way',
  in_progress: 'on_way',
  completed: 'completed',
  cancelled: 'cancelled',
};

const PAYMENT_METHOD_TO_API: Record<PaymentMethod, string> = {
  cash: 'cash',
  card: 'card',
  transfer: 'transfer',
  yape: 'yape_plin_qr',
  plin: 'yape_plin_qr',
};

function toDomain(sos: ApiSos, mechanicName = '', mechanicPhoto = ''): ServiceRequest {
  return {
    id: sos.id,
    userId: sos.driverId,
    mechanicId: sos.mechanicId ?? '',
    mechanicName,
    mechanicPhoto,
    status: STATUS_FROM_API[sos.status],
    problemDescription: sos.serviceTypeId ?? '',
    userLocation: { latitude: sos.location.lat, longitude: sos.location.lng },
    userAddress: sos.address,
    createdAt: sos.createdAt,
    estimatedCost: 0,
    paymentStatus: 'pending',
  };
}

export class ServiceRequestRepositoryRemoteImpl implements IServiceRequestRepository {
  async create(req: Omit<ServiceRequest, 'id' | 'createdAt'>): Promise<ServiceRequest> {
    const { sos, match } = await ApiClient.createSos({
      driverId: req.userId,
      serviceTypeId: req.problemDescription || undefined,
      address: req.userAddress,
      location: { lat: req.userLocation.latitude, lng: req.userLocation.longitude },
    });
    return toDomain(sos, match?.name ?? '', match?.photoUrl ?? '');
  }

  async findById(id: string): Promise<ServiceRequest | null> {
    const all = await ApiClient.getSosList();
    const found = all.find((s) => s.id === id);
    return found ? toDomain(found) : null;
  }

  async getHistory(userId: string): Promise<ServiceRequest[]> {
    const all = await ApiClient.getSosList();
    return all
      .filter((s) => s.driverId === userId || s.mechanicId === userId)
      .map((s) => toDomain(s));
  }

  async updateStatus(id: string, status: RequestStatus): Promise<void> {
    await ApiClient.updateSosStatus(id, STATUS_TO_API[status]);
  }

  async processPayment(id: string, method: PaymentMethod, amount: number): Promise<void> {
    const sos = await this.findById(id);
    if (!sos) throw new Error('Solicitud no encontrada');
    await ApiClient.createPayment({
      sosId: id,
      userId: sos.userId,
      amount,
      method: PAYMENT_METHOD_TO_API[method],
      concept: 'Pago de servicio',
    });
  }

  async submitReview(id: string, review: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
    await ApiClient.createReview({
      sosId: id,
      mechanicId: review.mechanicId,
      driverId: review.userId,
      rating: review.rating,
      comment: review.comment,
    });
  }
}
