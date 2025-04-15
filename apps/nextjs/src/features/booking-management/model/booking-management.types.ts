import type { z } from "zod";

import type { CreateBookingSchema } from "./booking-management.schema";

export type TCreateBooking = z.infer<typeof CreateBookingSchema>;
