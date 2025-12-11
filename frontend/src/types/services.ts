export interface BarbershopServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  commissionPercentage: number | null;
  createdAt: string;
  updatedAt: string;
}
