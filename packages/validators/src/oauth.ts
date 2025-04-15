import { z } from "zod";

// Field type enum
export const fieldEnum = z.enum([
  "ID",
  "EMAIL",
  "NAME",
  "ROLES",
  "BIRTHDAY",
  "VERIFIED",
]);

// OAuth client schemas
export const clientSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  client_id: z.string().optional(),
  redirect_uri: z.string().optional(),
  secret: z.string().optional(),
  fields: z.array(fieldEnum).optional(),
});

export const clientInfoSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  fields: z.array(fieldEnum).optional(),
});

export const clientForListSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
});

// OAuth requests
export const createClientSchema = z.object({
  name: z.string(),
  redirect_uri: z.string().url(),
  fields: z.array(fieldEnum),
});

export const updateClientSchema = z.object({
  name: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  fields: z.array(fieldEnum).optional(),
  update_secret: z.boolean().optional(),
});

// OAuth query params
export const oauthQuerySchema = z.object({
  code_challenge: z.string(),
  client_id: z.string(),
});

export const codeQuerySchema = z.object({
  client_id: z.string(),
});

export const tokenQuerySchema = z.object({
  code_verifier: z.string(),
  code: z.string(),
});

export const refreshQuerySchema = z.object({
  client_id: z.string(),
  type: z.string(),
});

// OAuth responses
export const oauthTokensSchema = z.object({
  coffee: z.string().optional(),
  resource: z.string().optional(),
});

export const resourceTokenSchema = z.object({
  resource: z.string().optional(),
});

// Types
export type ClientResponse = z.infer<typeof clientSchema>;
export type ClientInfoResponse = z.infer<typeof clientInfoSchema>;
export type ClientListResponse = z.infer<typeof clientForListSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type OAuthQuery = z.infer<typeof oauthQuerySchema>;
export type CodeQuery = z.infer<typeof codeQuerySchema>;
export type TokenQuery = z.infer<typeof tokenQuerySchema>;
export type RefreshQuery = z.infer<typeof refreshQuerySchema>;
export type OAuthTokensResponse = z.infer<typeof oauthTokensSchema>;
export type ResourceTokenResponse = z.infer<typeof resourceTokenSchema>;
