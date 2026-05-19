export interface Review {
  id: string;
  requestId: string;
  mechanicId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}
