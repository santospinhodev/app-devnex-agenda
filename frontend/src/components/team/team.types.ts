export type TeamRole = "BARBER" | "RECEPTIONIST";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: TeamRole;
  isActive: boolean;
}

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  BARBER: "Barbeiro",
  RECEPTIONIST: "Recepcionista",
};

export const TEAM_ROLE_ENDPOINTS: Record<TeamRole, string> = {
  BARBER: "/users/barbers",
  RECEPTIONIST: "/users/receptionists",
};
