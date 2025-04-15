"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  getLocalTimeZone,
  getWeeksInMonth,
  today,
} from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { Calendar } from "~/shared/ui/calendar";
import { useBooking } from "../../hooks/use-booking";
import { FloorMap } from "../booking-map/floor-map";
import { FloorSelector } from "../booking-map/floor-selector";
import { BookingResult } from "../booking-result/booking-result";
import { RightPanel } from "../right-panel";

export function BookingView(props: React.ComponentProps<"div">) {
  const { locale } = useLocale();
  const {
    currentStep,
    date,

    timeFrom,
    timeTo,
    selectedFloorId,
    selectedEntity,
    goBack,

    formatSelectedDate,
    formatSelectedTimeRange,
    handleChangeDate,
    handleChangeAvailableTime,
    handleFloorSelect,
    handleEntitySelect,
    resetBooking,
    setFocusedDate,
  } = useBooking();

  const router = useRouter();

  return (
    <>
      <Button
        className="absolute left-2 top-2 z-10"
        variant="outline"
        size="icon"
        onClick={() => {
          router.back();
        }}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div
        {...props}
        className={cn(
          "w-fit rounded-lg border bg-background shadow-sm sm:max-w-[1000px]",
          props.className,
        )}
      >
        <div className="p-3 sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-x-10 gap-y-4 sm:mb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              {currentStep !== "selection" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="mr-2 gap-1 text-muted-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Назад
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8",
                    currentStep === "selection"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  1
                </div>
                <div className="h-[2px] w-3 bg-muted sm:w-4"></div>
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8",
                    currentStep === "map"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  2
                </div>
                <div className="h-[2px] w-3 bg-muted sm:w-4"></div>
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8",
                    currentStep === "qrcode"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  3
                </div>
              </div>
            </div>

            {timeFrom && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/30 px-2 py-1 text-xs text-muted-foreground sm:text-sm">
                        <CalendarIcon className="size-3 sm:size-3.5" />
                        <span>{formatSelectedDate()}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Выбранная дата</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {timeTo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/30 px-2 py-1 text-xs text-muted-foreground sm:text-sm">
                          <Clock className="size-3 sm:size-3.5" />
                          <span>{formatSelectedTimeRange()}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Выбранный временной диапазон
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          {currentStep === "selection" && (
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row">
              <div className="flex w-full flex-col items-center md:items-start">
                <div className="w-full max-w-full md:max-w-full">
                  <Calendar
                    minValue={today(getLocalTimeZone())}
                    defaultValue={today(getLocalTimeZone())}
                    value={date}
                    onChange={handleChangeDate}
                    onFocusChange={(focused) => setFocusedDate(focused)}
                    className={cn(
                      "w-full rounded-md bg-card p-1 xs:p-2 sm:p-4",
                      timeFrom ? "border border-muted" : "border-0",
                    )}
                  />
                </div>
                {timeFrom && (
                  <div className="mt-2 w-full max-w-full text-center text-xs text-muted-foreground sm:mt-3 sm:max-w-[320px] sm:text-sm md:max-w-full">
                    <p>
                      Selected date:{" "}
                      <span className="font-medium text-foreground">
                        {formatSelectedDate()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <RightPanel
                date={date}
                weeksInMonth={getWeeksInMonth(date, locale)}
                handleChangeAvailableTime={handleChangeAvailableTime}
              />
            </div>
          )}

          {currentStep === "map" && (
            <div className="flex flex-col space-y-4 sm:space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start sm:gap-0">
                <FloorSelector
                  selectedFloorId={selectedFloorId}
                  onFloorSelect={handleFloorSelect}
                />

                <div className="mt-2 flex flex-wrap items-center gap-3 sm:mt-0 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-100 dark:bg-green-900/20"></div>
                    <span className="text-xs text-muted-foreground">
                      Доступно
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-100 dark:bg-red-900/20"></div>
                    <span className="text-xs text-muted-foreground">
                      Забронировано
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-100 dark:bg-amber-900/20"></div>
                    <span className="text-xs text-muted-foreground">
                      В ожидании
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-100 dark:bg-gray-900/20"></div>
                    <span className="text-xs text-muted-foreground">
                      В ремонте
                    </span>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="h-[400px] w-full sm:h-[500px] md:h-[600px]">
                    {selectedFloorId && (
                      <FloorMap
                        floorId={selectedFloorId}
                        startTime={timeFrom ?? undefined}
                        endTime={timeTo ?? undefined}
                        onSelectEntity={handleEntitySelect}
                        selectedEntityId={selectedEntity?.id}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-0">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Выберите доступное пространство на карте этажа
                </p>
                <Button variant="outline" size="sm" onClick={resetBooking}>
                  Изменить дату/время
                </Button>
              </div>
            </div>
          )}

          {currentStep === "qrcode" && <BookingResult />}
        </div>
      </div>
    </>
  );
}
