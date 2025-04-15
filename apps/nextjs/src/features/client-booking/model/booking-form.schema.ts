import { z } from "zod";

export const BookingFormSchema = z.object({
  user_id: z.string().min(1),
  entity_id: z.string().min(1),
  start_date: z.date(),
  end_date: z.date(),
  orders: z.array(
    z.object({
      id: z.string().min(1),
    }),
  ),
});
