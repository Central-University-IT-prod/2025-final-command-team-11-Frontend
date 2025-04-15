"use client";

import { useEffect } from "react";

import { $adminApi } from "@acme/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

interface FloorSelectorProps {
  selectedFloorId: string;
  onFloorSelect: (floorId: string) => void;
}

export function FloorSelector({
  selectedFloorId,
  onFloorSelect,
}: FloorSelectorProps) {
  const { data: floors, isLoading } = $adminApi.useQuery(
    "get",
    "/layout/floors",
    {},
    {
      refetchOnWindowFocus: false,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  );

  useEffect(() => {
    if (floors && floors.length > 0) {
      onFloorSelect(floors[0]?.id ?? "");
    }
  }, [floors, onFloorSelect]);

  if (isLoading) {
    return (
      <div className="h-8 w-36 animate-pulse rounded bg-muted sm:h-10 sm:w-40"></div>
    );
  }

  if (floors?.length === 0) {
    return (
      <div className="text-xs text-muted-foreground sm:text-sm">Нет этажей</div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground sm:text-sm">Этаж:</span>
      <Select
        value={selectedFloorId}
        onValueChange={(value) => onFloorSelect(value)}
      >
        <SelectTrigger className="h-8 w-36 text-xs sm:h-10 sm:w-40 sm:text-sm">
          <SelectValue placeholder="Выберите этаж" />
        </SelectTrigger>
        <SelectContent>
          {floors?.map((floor) => (
            <SelectItem
              key={floor.id}
              value={floor.id ?? ""}
              className="text-xs sm:text-sm"
            >
              {floor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
