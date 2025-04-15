import type { z } from "zod";

import type { WorkloadSchema } from "./workload.schema";

export type TWorkload = z.infer<typeof WorkloadSchema>;
