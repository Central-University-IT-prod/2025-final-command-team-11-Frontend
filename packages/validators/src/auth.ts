import { z } from "zod";

// Auth requests
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Auth responses
export const tokenSchema = z.object({
  token: z.string().optional(),
});

export const tokenResponseSchema = tokenSchema;

export const loginResponseSchema = z.object({
  email: z.string(),
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
});

export const registerResponseSchema = z.object({
  email: z.string(),
  id: z.string().uuid(),
  name: z.string(),
  token: z.string(),
});

// Auth headers
export const oauthHeaderSchema = z.object({
  "Yandex-Token": z.string(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type OAuthHeader = z.infer<typeof oauthHeaderSchema>;
