import type { z } from "zod";

import type { RegisterScheme } from "./register.scheme";

export type TRegister = z.infer<typeof RegisterScheme>;
