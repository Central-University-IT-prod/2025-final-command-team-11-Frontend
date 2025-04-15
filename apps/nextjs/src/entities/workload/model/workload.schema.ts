import { z } from "zod";

export const WorkloadSchema = z.object({
  time: z.number(),
  is_free: z.boolean(),
});