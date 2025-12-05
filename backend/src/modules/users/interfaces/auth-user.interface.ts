import { Permission } from "../../../common/enums/permission.enum";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  permissions: Permission[];
  roles: Permission[];
  barbershop?: {
    id: string;
    name: string;
  } | null;
  barberProfile?: {
    id: string;
    barbershopId: string;
  } | null;
}
