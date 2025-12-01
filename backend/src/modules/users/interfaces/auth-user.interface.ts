import { Permission } from "../../../common/enums/permission.enum";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  permissions: Permission[];
  barbershop?: {
    id: string;
    name: string;
  } | null;
}
