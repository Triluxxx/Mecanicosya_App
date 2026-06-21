export type PartCategory = 'llanta' | 'camara' | 'cadena' | 'aceite' | 'frenos' | 'otro';

export interface Part {
  id: string;
  mechanicId: string;
  mechanicName: string;
  name: string;
  category: PartCategory;
  price: number;
  stock: number;
  photo: string;
  description: string;
}
