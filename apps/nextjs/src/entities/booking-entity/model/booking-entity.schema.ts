import { z } from "zod";

export const BookingEntitySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["ROOM", "OPEN_SPACE"]),
  floor_id: z.string().uuid(),
  capacity: z.number(),
  title: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  updated_at: z.string().datetime(),
});
