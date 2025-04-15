import type { z } from "zod";

import type { BookingEntitySchema } from "./booking-entity.schema";

export type TBookingEntity = z.infer<typeof BookingEntitySchema>;
