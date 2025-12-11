export interface SanitizedBarberProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  commissionPercentage?: number | null;
  bio?: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    permissions: string[];
  };
  barbershop: {
    id: string;
    name: string;
  };
}
