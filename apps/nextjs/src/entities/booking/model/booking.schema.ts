import { z } from "zod";

import { AccountSchema } from "~/entities/account/model/account.schema";
import { BookingEntitySchema } from "~/entities/booking-entity/model/booking-entity.schema";
import { OrderSchema } from "~/entities/order/model/order.schema";

export const BookingSchema = z.object({
  id: z.string().uuid(),
  entity_id: z.string().uuid(),
  entity: BookingEntitySchema,
  user_id: z.string().uuid(),
  user: AccountSchema,
  orders: z.array(OrderSchema),
  time_from: z.number(),
  time_to: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});
