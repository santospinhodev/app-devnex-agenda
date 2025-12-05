export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  permissions: string[];
  barbershop?: {
    id: string;
    name: string;
  } | null;
}
