export interface SanitizedReceptionistProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
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
  createdAt: string;
  updatedAt: string;
}
