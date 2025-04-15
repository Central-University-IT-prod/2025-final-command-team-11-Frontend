import { Map } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import type { TFloorLayout } from "../../model/floor-layout.types";
import { TimeAgo } from "~/shared/ui/time-ago";

export function LayoutCard({ floorLayout }: { floorLayout: TFloorLayout }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {floorLayout.name}
        </CardTitle>
        <Map className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-40 rounded-md bg-muted/50 p-2">
          <div className="grid h-full grid-cols-3 gap-1">
            <div className="rounded bg-primary/10"></div>
            <div className="rounded bg-primary/10"></div>
            <div className="rounded bg-primary/10"></div>
            <div className="col-span-2 rounded bg-primary/20"></div>
            <div className="rounded bg-primary/10"></div>
            <div className="col-span-3 rounded bg-primary/20"></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Last edited:{" "}
          <TimeAgo date={floorLayout.updatedAt ?? floorLayout.createdAt} />
        </div>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
