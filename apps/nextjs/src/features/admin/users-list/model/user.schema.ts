import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  id: z.string().uuid(),
  verified: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  role: z.enum(["admin", "user"]).optional().default("user"),
});
