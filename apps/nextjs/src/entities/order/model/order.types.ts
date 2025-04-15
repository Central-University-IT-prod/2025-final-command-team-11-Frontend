import type { z } from "zod";

import type { OrderSchema } from "./order.schema";

export type TOrder = z.infer<typeof OrderSchema>;
