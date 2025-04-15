import { z } from "zod";

export const accountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    oldPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      return !(data.password && !data.oldPassword);
    },
    {
      message: "Old password is required when setting a new password",
      path: ["oldPassword"],
    },
  );

export const deleteUserSchema = z.object({
  password: z.string(),
});

export const setRoleSchema = z.object({
  id: z.number().optional(),
  role: z.string().optional(),
});

export const accountResponseSchema = accountSchema;

export const verifyCodeSchema = z.object({
  code: z.string(),
});

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
