import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  verified: z.boolean(),
});
