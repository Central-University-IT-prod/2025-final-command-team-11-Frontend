import type { z } from "zod";

import type { BookingSchema } from "./booking.schema";
import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";

export type TBooking = z.infer<typeof BookingSchema>;

export interface Guest {
  email: string;
}

export interface BookingStatus {
  status: "available" | "booked" | "pending" | "maintenance";
  bookingId?: string;
}

export interface BookingFormData {
  guests: Guest[];
  selectedOrders: string[];
  entity?: TBookingEntity;
  startTime?: string;
  endTime?: string;
}

export type BookingStep = "selection" | "map" | "form" | "qrcode" | undefined;

export interface TimeSlot {
  12: string;
  24: string;
}
