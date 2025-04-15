import type { z } from "zod";

import type { FloorLayoutSchema } from "./floor-layout.schema";

export type TFloorLayout = z.infer<typeof FloorLayoutSchema>;
