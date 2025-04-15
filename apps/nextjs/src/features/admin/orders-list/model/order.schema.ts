import { z } from "zod";

export const OrderSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
  booking_id: z.string(),
  thing: z.enum(["laptop", "eboard", "coffee"]),
  created_at: z.string(),
  updated_at: z.string(),
});
