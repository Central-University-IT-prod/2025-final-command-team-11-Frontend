import { z } from "zod";

export const OrderSchema = z.object({
  id: z.string(),
  booking_id: z.string(),
  completed: z.boolean(),
  thing: z.enum(["laptop", "eboard", "coffee"]),
  created_at: z.number(),
  updated_at: z.number(),
});
