import type { z } from "zod";

import type { AccountSchema } from "./account.schema";

export type TAccount = z.infer<typeof AccountSchema>;
