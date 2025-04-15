"use client";

import { useEffect, useState } from "react";

import { $adminApi } from "@acme/api";

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";

interface FloorMapProps {
  floorId: string;
  onSelectEntity: (entity: TBookingEntity) => void;
  selectedEntityId?: string;
}

export function FloorMap({
  floorId,
  onSelectEntity,
  selectedEntityId,
}: FloorMapProps) {
  const [entities, setEntities] = useState<TBookingEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: floorData } = $adminApi.useQuery(
    "get",
    "/layout/floors/{id}",
    {
      params: {
        path: { id: floorId },
      },
    },
    {
      enabled: !!floorId,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  );

  useEffect(() => {
    setIsLoading(true);
    if (floorData) {
      const mappedEntities: TBookingEntity[] = floorData.map((entity) => ({
        id: entity.id ?? "",
        type: entity.type ?? "OPEN_SPACE",
        capacity: entity.capacity ?? 1,
        title: entity.title ?? `Место ${entity.id?.slice(0, 4)}`,
        x: entity.x ?? 0,
        y: entity.y ?? 0,
        floor_id: floorId,
        width: entity.width ?? 30,
        height: entity.height ?? 10,
        updated_at: entity.updated_at ?? "",
      }));
      setEntities(mappedEntities);
    }
    setIsLoading(false);
  }, [floorData, floorId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Загрузка сущностей этажа...
        </p>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          На этом этаже нет доступных мест
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-muted/30">
      {/* Сетка для визуального эффекта */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`,
          backgroundSize: `calc(100% / 10) calc(100% / 10)`,
        }}
      />

      {/* Отрисовка сущностей */}
      {entities.map((entity) => (
        <div
          key={entity.id}
          className={`absolute cursor-pointer rounded-sm transition-all hover:shadow-md ${
            selectedEntityId === entity.id
              ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
              : "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/40"
          }`}
          style={{
            left: `${entity.x}%`,
            top: `${entity.y}%`,
            width: `${entity.width}%`,
            height: `${entity.height}%`,
          }}
          onClick={() => onSelectEntity(entity)}
        >
          <div className="flex h-full w-full flex-col items-center justify-center p-1">
            <span className="truncate text-xs font-medium">{entity.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
