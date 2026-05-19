export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'in_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface ServiceRequest {
  id: string;
  userId: string;
  mechanicId: string;
  mechanicName: string;
  mechanicPhoto: string;
  status: RequestStatus;
  problemDescription: string;
  userLocation: { latitude: number; longitude: number };
  userAddress: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  estimatedCost: number;
  finalCost?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  rating?: number;
  review?: string;
}
