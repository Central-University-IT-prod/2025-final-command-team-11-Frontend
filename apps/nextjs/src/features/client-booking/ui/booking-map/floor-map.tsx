"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Lock,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";

import { $adminApi, $bookingApi } from "@acme/api";
import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";

interface BookingStatus {
  status: "available" | "booked" | "pending" | "maintenance";
  bookingId?: string;
}

interface FloorEntityWithStatus extends TBookingEntity {
  bookingStatus: BookingStatus;
}

interface FloorMapProps {
  floorId: string;
  startTime?: Date;
  endTime?: Date;
  onSelectEntity: (entity: FloorEntityWithStatus) => void;
  selectedEntityId?: string;
}

export function FloorMap({
  floorId,
  startTime,
  endTime,
  onSelectEntity,
  selectedEntityId,
}: FloorMapProps) {
  const [entities, setEntities] = useState<FloorEntityWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      retry: 3,
      retryDelay: 1000,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      onError: (error: Error) => {
        console.error("Error fetching floor data:", error);
      },
    },
  );

  const { data: availabilityData, refetch } = $bookingApi.useQuery(
    "get",
    "/workloads/floors/{floorId}",
    {
      params: {
        path: { floorId },
        query: {
          timeFrom: startTime
            ? Math.floor(startTime.getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          timeTo: endTime
            ? Math.floor(endTime.getTime() / 1000)
            : Math.floor(Date.now() / 1000 + 3600),
        },
      },
    },
    {
      retry: 3,
      retryDelay: 1000,
      onError: (error: Error) => {
        console.error("Error fetching availability data:", error);
      },
    },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    setIsLoading(true);

    if (floorData) {
      try {
        const mappedEntities: FloorEntityWithStatus[] = floorData.map(
          (entity) => {
            const availabilityStatus = availabilityData?.find(
              (item) => item.entity.id === entity.id,
            );

            console.log("availabilityStatus", availabilityStatus);
            console.log("availabilityData", availabilityData);

            return {
              id: entity.id ?? "",
              type: entity.type ?? "OPEN_SPACE",
              capacity: entity.capacity ?? 1,
              title: entity.title ?? `Space ${entity.id?.slice(0, 4)}`,
              x: entity.x ?? 0,
              y: entity.y ?? 0,
              floor_id: floorId,
              width: entity.width ?? 30,
              height: entity.height ?? 10,
              updated_at: entity.updated_at ?? "",
              bookingStatus: availabilityData
                ? {
                    status: availabilityStatus?.is_free
                      ? "available"
                      : "booked",
                    bookingId: availabilityStatus
                      ? availabilityStatus.entity.id
                      : undefined,
                  }
                : { status: "available" },
            };
          },
        );
        setEntities(mappedEntities);
        console.log("mappedEntities", mappedEntities);
      } catch (err) {
        console.error("Error processing entity data:", err);
      }
    }

    setIsLoading(false);
  }, [floorData, floorId, availabilityData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="relative mb-6 h-48 w-48 opacity-30">
          <div className="entity-card absolute left-[20%] top-[20%] h-[20%] w-[20%] animate-pulse rounded-md border border-muted bg-muted/20" />
          <div className="entity-card absolute left-[50%] top-[30%] h-[25%] w-[30%] animate-pulse rounded-md border border-muted bg-muted/20" />
          <div className="entity-card absolute left-[30%] top-[60%] h-[20%] w-[40%] animate-pulse rounded-md border border-muted bg-muted/20" />
        </div>
        <div className="flex flex-col items-center">
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-medium">Loading floor map</p>
            <p className="text-sm text-muted-foreground">
              {startTime && endTime ? (
                <>Checking availability for the selected time slot</>
              ) : (
                <>Please wait while we load the floor plan</>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <Card className="max-w-md border-amber-200 bg-amber-50/50 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/10">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <BuildingIcon className="mb-4 h-10 w-10 text-amber-500" />
            <h3 className="mb-2 text-lg font-medium">No Spaces Available</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {startTime && endTime ? (
                <>
                  There are no bookable spaces on this floor for the selected
                  time range.
                  <br />
                  Try selecting a different time or floor.
                </>
              ) : (
                <>
                  There are no bookable spaces configured for this floor.
                  <br />
                  Please select a different floor.
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {startTime?.toLocaleDateString()} •{" "}
                {startTime?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {endTime &&
                  ` - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (
    status: BookingStatus["status"],
    isSelected: boolean,
  ) => {
    if (isSelected) {
      return "bg-primary/10 hover:bg-primary/20 border-primary/50 dark:bg-primary/20 dark:hover:bg-primary/30 dark:border-primary/40 ring-2 ring-primary/50 shadow-lg shadow-primary/10";
    }

    switch (status) {
      case "available":
        return "bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:border-green-800/30 hover:border-green-400";
      case "booked":
        return "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-800/30";
      case "pending":
        return "bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:border-amber-800/30";
      case "maintenance":
        return "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-900/10 dark:hover:bg-gray-900/20 dark:border-gray-800/30";
      default:
        return "bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 dark:border-amber-800/30";
    }
  };

  const getStatusBadgeStyle = (status: BookingStatus["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-green-400/30 pulse-animation";
      case "booked":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      case "maintenance":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
    }
  };

  const getStatusIcon = (
    status: BookingStatus["status"],
    isSelected: boolean,
  ) => {
    if (isSelected) {
      return (
        <CheckCircle2 className="size-3.5 flex-shrink-0 text-primary animate-in fade-in zoom-in" />
      );
    }

    switch (status) {
      case "available":
        return null;
      case "booked":
        return <Lock className="size-3.5 flex-shrink-0 text-red-500/70" />;
      case "pending":
        return <Clock className="size-3.5 flex-shrink-0 text-amber-500/70" />;
      case "maintenance":
        return <XCircle className="size-3.5 flex-shrink-0 text-gray-500/70" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full w-full bg-muted/30">
      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .pulse-animation {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .glass-card {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .entity-card {
          transition: all 0.3s ease;
        }

        .entity-card:hover {
          transform: translateY(-2px);
        }

        .entity-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: inherit;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .entity-card:hover::before {
          opacity: 1;
        }

        .entity-selected {
          animation: flash-border 2s ease-in-out infinite;
        }

        @keyframes flash-border {
          0%,
          100% {
            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5);
          }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`,
          backgroundSize: `calc(100% / 10) calc(100% / 10)`,
        }}
      />

      <div className="absolute right-3 top-3 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-1 rounded-full border-border/50 bg-background/90 px-3 py-1 text-xs shadow-sm backdrop-blur-sm"
        >
          <RefreshCw
            className={cn("h-3 w-3", isRefreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <div className="absolute left-3 top-3 z-10 rounded-md border border-border/50 bg-background/90 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p>Available</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <p>Booked</p>
          </div>
          {selectedEntityId && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <p>Selected</p>
            </div>
          )}
        </div>
        <p className="z-10 text-[10px] text-muted-foreground">
          Click on an available space to select it for booking
        </p>
      </div>

      {startTime && endTime && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md border border-border/50 bg-background/90 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {startTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" - "}
              {endTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}

      {entities.map((entity) => {
        const isSelected = entity.id === selectedEntityId;
        return (
          <TooltipProvider key={entity.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "entity-card glass-card group absolute cursor-pointer overflow-hidden rounded-md border shadow backdrop-blur-[2px] transition-all hover:z-10 hover:shadow-md",
                    getStatusColor(entity.bookingStatus.status, isSelected),
                    entity.bookingStatus.status !== "available" &&
                      !isSelected &&
                      "opacity-80 hover:opacity-95",
                    entity.bookingStatus.status === "available" &&
                      !isSelected &&
                      "hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-900/30",
                    isSelected && "entity-selected z-20",
                  )}
                  style={{
                    left: `${entity.x}%`,
                    top: `${entity.y}%`,
                    width: `${entity.width}%`,
                    height: `max(${entity.height}%, 100px)`,
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    transition:
                      "transform 0.2s ease, opacity 0.2s ease, box-shadow 0.3s ease",
                  }}
                  onClick={() => {
                    if (entity.bookingStatus.status === "available") {
                      onSelectEntity(entity);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex h-full w-full flex-col p-1.5 transition-transform group-hover:scale-[1.02] sm:p-2 md:p-3",
                      entity.bookingStatus.status === "available" &&
                        "cursor-pointer",
                    )}
                    style={{ transformOrigin: "center center" }}
                  >
                    <div className="mb-auto flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {entity.type === "ROOM" ? (
                          <Building2 className="size-2.5 flex-shrink-0 text-muted-foreground/70 sm:size-3" />
                        ) : (
                          <Layers className="size-2.5 flex-shrink-0 text-muted-foreground/70 sm:size-3" />
                        )}
                        <span className="truncate text-[10px] font-medium sm:text-xs">
                          {entity.title}
                        </span>
                      </div>
                      {getStatusIcon(entity.bookingStatus.status, isSelected)}
                    </div>

                    <div className="mt-auto flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Users className="size-2.5 flex-shrink-0 text-muted-foreground/70 sm:size-3" />
                        <span className="text-[10px] text-muted-foreground sm:text-xs">
                          {entity.capacity}{" "}
                          {entity.capacity === 1 ? "person" : "people"}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1 w-full justify-center rounded-sm border-0 py-0.5 text-[8px] font-medium capitalize sm:text-[10px]",
                          isSelected
                            ? "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground"
                            : getStatusBadgeStyle(entity.bookingStatus.status),
                          entity.bookingStatus.status === "available" &&
                            !isSelected &&
                            "pulse-animation",
                        )}
                      >
                        {isSelected ? "Selected" : entity.bookingStatus.status}
                        {entity.bookingStatus.status === "available" &&
                          !isSelected &&
                          " • Click to select"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background text-xs">
                <p className="font-medium">{entity.title}</p>
                <p className="text-muted-foreground">
                  {entity.type === "ROOM" ? "Meeting Room" : "Open Space"} •{" "}
                  {entity.capacity}{" "}
                  {entity.capacity === 1 ? "person" : "people"}
                </p>
                <p className="mt-1 font-medium capitalize">
                  Status:{" "}
                  <span
                    className={
                      isSelected
                        ? "text-primary"
                        : entity.bookingStatus.status === "available"
                          ? "text-green-600"
                          : "text-red-600"
                    }
                  >
                    {isSelected ? "Selected" : entity.bookingStatus.status}
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

function BuildingIcon(props: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", props.className)}>
      <Building2 className="h-6 w-6" />
    </div>
  );
}
