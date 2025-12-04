import { AppointmentStatus } from "@prisma/client";

export interface AppointmentCustomerMeta {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface AppointmentServiceMeta {
  id: string;
  name: string;
  durationMin: number;
  price: string;
}

export interface AppointmentWithMeta {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  service: AppointmentServiceMeta;
  customer: AppointmentCustomerMeta;
}

export interface AppointmentResponse {
  id: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes: string | null;
  service: AppointmentServiceMeta;
  customer: AppointmentCustomerMeta;
}
