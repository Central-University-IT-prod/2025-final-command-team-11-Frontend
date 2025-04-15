import type { z } from "zod";

import type { UserSchema } from "./user.schema";

export type TUser = z.infer<typeof UserSchema>;
