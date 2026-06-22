export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'in_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'yape' | 'plin';
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
  mechanicLocation?: { latitude: number; longitude: number };
  etaMinutes?: number;
  createdAt: string;
  acceptedAt?: string;
  inRouteAt?: string;
  completedAt?: string;
  estimatedCost: number;
  finalCost?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  rating?: number;
  review?: string;
}
