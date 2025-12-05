export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  permissions: string[];
  roles: string[];
  barbershop?: {
    id: string;
    name: string;
  } | null;
  barberProfile?: {
    id: string;
    barbershopId: string;
  } | null;
}
