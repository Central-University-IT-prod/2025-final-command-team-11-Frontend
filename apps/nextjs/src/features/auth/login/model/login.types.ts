import type { z } from "zod";

import type { LoginScheme } from "./login.scheme";

export type TLogin = z.infer<typeof LoginScheme>;
