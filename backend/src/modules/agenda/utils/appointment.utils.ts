import { AppointmentWithMeta } from "../../appointments/types/appointment.types";
import { SlotAppointmentDetails } from "../types/agenda.types";

export function buildSlotAppointmentDetails(
  appointment: AppointmentWithMeta
): SlotAppointmentDetails {
  return {
    id: appointment.id,
    status: appointment.status,
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    notes: appointment.notes,
    service: appointment.service,
    customer: appointment.customer,
  };
}
