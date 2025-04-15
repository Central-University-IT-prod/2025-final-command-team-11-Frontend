import { z } from "zod";

export const LoginScheme = z.object({
  email: z.string().min(1, "Email must be valid").email(),
  password: z
    .string()
    .min(8)
    .max(50)
    .refine(
      (value) =>
        /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/.test(value),
      {
        message:
          "Password must include at least one uppercase letter and one special character",
      },
    ),
});
