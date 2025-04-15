import { z } from "zod";

import { BookingEntitySchema } from "~/entities/booking-entity/model/booking-entity.schema";

export const FloorLayoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  entities: z.array(BookingEntitySchema),
  updatedAt: z.date().optional(),
  createdAt: z.date(),
});
