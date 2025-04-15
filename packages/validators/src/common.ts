import { z } from "zod";

// Common response schemas
export const errorResponseSchema = z.object({
  error: z.string().optional(),
});

export const messageResponseSchema = z.object({
  message: z.string().optional(),
});

// Path parameter schemas
export const idParamSchema = z.object({
  id: z.coerce.number(),
});

export const codeParamSchema = z.object({
  code: z.string(),
});

// Types
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type CodeParam = z.infer<typeof codeParamSchema>;
