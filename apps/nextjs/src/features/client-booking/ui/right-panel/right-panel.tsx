import type { DateValue } from "@react-aria/calendar";
import { useEffect, useRef, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { ArrowRight, Clock, Info } from "lucide-react";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { availableTimes } from "../../mock/available-times";

export function RightPanel({
  date,
  weeksInMonth,
  handleChangeAvailableTime,
}: {
  date: DateValue;
  weeksInMonth: number;
  handleChangeAvailableTime: (startTime: string, endTime: string) => void;
}) {
  const { locale } = useLocale();
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"12" | "24">("12");
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number>(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectionMode, setSelectionMode] = useState<"start" | "end">("start");

  const [scrollPosition, setScrollPosition] = useState<number>(0);

  useEffect(() => {
    if (previewRef.current) {
      setPreviewHeight(previewRef.current.scrollHeight);
    }
  }, [selectedStartTime, hoverTime]);

  useEffect(() => {
    if (scrollRef.current && scrollPosition > 0) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [hoverTime, scrollPosition]);

  const [dayNumber, dayName] = date
    .toDate(getLocalTimeZone())
    .toLocaleDateString(locale, {
      weekday: "short",
      day: "numeric",
    })
    .split(" ");

  const MIN_TIME_RANGE = 1;
  const MAX_TIME_RANGE = 8;

  const getTimeIndex = (time: string): number => {
    return availableTimes.findIndex((t) => t[activeTab] === time);
  };

  const isValidTimeRange = (startIndex: number, endIndex: number): boolean => {
    if (startIndex === -1 || endIndex === -1) return false;

    const diff = Math.abs(endIndex - startIndex);
    return diff >= MIN_TIME_RANGE && diff <= MAX_TIME_RANGE;
  };

  const handleTimeSelection = (time: string) => {
    if (selectionMode === "start") {
      setSelectedStartTime(time);
      setSelectionMode("end");
      return;
    }

    // We're in end selection mode
    if (!selectedStartTime) return; // Safety check

    const startIndex = getTimeIndex(selectedStartTime);
    const endIndex = getTimeIndex(time);

    if (!isValidTimeRange(startIndex, endIndex)) {
      const errorMsg =
        startIndex === endIndex
          ? "Пожалуйста, выберите другое время окончания"
          : endIndex - startIndex > MAX_TIME_RANGE
            ? "Временной диапазон слишком длинный (максимум 4 часа)"
            : "Временной диапазон слишком короткий (минимум 30 минут)";

      alert(errorMsg);
      return;
    }

    if (startIndex < endIndex) {
      handleChangeAvailableTime(selectedStartTime, time);
    } else {
      handleChangeAvailableTime(time, selectedStartTime);
    }

    // Reset selection state
    setSelectedStartTime(null);
    setHoverTime(null);
    setSelectionMode("start");
  };

  const handleTimeHover = (time: string) => {
    if (selectedStartTime && selectionMode === "end") {
      if (scrollRef.current) {
        setScrollPosition(scrollRef.current.scrollTop);
      }
      setHoverTime(time);
    }
  };

  const handleTimeButtonFocus = (time: string) => {
    // For keyboard navigation and accessibility
    handleTimeHover(time);
  };

  const handleTimeButtonBlur = () => {
    // Only clear hover if we're not on mobile (where focus events behave differently)
    if (window.matchMedia("(min-width: 768px)").matches) {
      setHoverTime(null);
    }
  };

  const calculateDuration = (
    time1Index: number,
    time2Index: number,
  ): string => {
    const diff = Math.abs(time1Index - time2Index);
    const minutes = diff * 30;

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}ч ${remainingMinutes}м`
        : `${hours}ч`;
    }

    return `${minutes}м`;
  };

  const getTimeButtonStyle = (time: string): string => {
    if (!selectedStartTime) return "";

    const timeIndex = getTimeIndex(time);
    const startIndex = getTimeIndex(selectedStartTime);

    if (time === selectedStartTime) {
      return "bg-primary text-primary-foreground font-medium";
    }

    if (hoverTime) {
      const hoverIndex = getTimeIndex(hoverTime);

      const isInHoverRange =
        (startIndex < timeIndex && timeIndex <= hoverIndex) ||
        (startIndex > timeIndex && timeIndex >= hoverIndex);

      if (isInHoverRange) {
        const isValid = isValidTimeRange(startIndex, hoverIndex);

        return isValid
          ? "bg-primary/15 border-primary"
          : "bg-destructive/10 border-destructive text-destructive/80";
      }
    }

    const isValidEndTime = isValidTimeRange(startIndex, timeIndex);

    return isValidEndTime
      ? "border-primary/30 hover:border-primary hover:bg-primary/10"
      : "";
  };

  const renderTimeDurationPreview = () => {
    if (!selectedStartTime || !hoverTime) return null;

    const startIndex = getTimeIndex(selectedStartTime);
    const hoverIndex = getTimeIndex(hoverTime);

    if (startIndex === -1 || hoverIndex === -1) return null;

    const duration = calculateDuration(startIndex, hoverIndex);
    const isValidDuration = isValidTimeRange(startIndex, hoverIndex);

    return (
      <div
        ref={previewRef}
        className={cn(
          "my-2 flex items-center justify-between rounded-md border p-2",
          isValidDuration
            ? "border-primary bg-primary/10"
            : "border-destructive bg-destructive/10",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate text-sm font-medium">
            {selectedStartTime}
          </div>
          <ArrowRight size={16} />
          <div className="truncate text-sm font-medium">{hoverTime}</div>
        </div>
        <Badge
          variant={isValidDuration ? "outline" : "destructive"}
          className={cn(
            "ml-2 whitespace-nowrap",
            isValidDuration ? "" : "bg-destructive/10",
          )}
        >
          <Clock className="mr-1 size-3" />
          {duration}
        </Badge>
      </div>
    );
  };

  return (
    <>
      <Separator className="sm:hidden" />
      <Tabs
        defaultValue="12"
        className="flex w-full flex-col gap-4 sm:border-l sm:pl-6 md:w-[500px]"
        onValueChange={(value) => {
          setActiveTab(value as "12" | "24");
          setSelectedStartTime(null);
          setHoverTime(null);
          setSelectionMode("start");
        }}
      >
        <div className="flex items-center justify-between">
          <p
            aria-hidden
            className="align-center text-md flex-1 font-bold text-foreground"
          >
            {dayName} <span className="text-muted-foreground">{dayNumber}</span>
          </p>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="12">12ч</TabsTrigger>
            <TabsTrigger value="24">24ч</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          {selectionMode === "end" ? (
            <Badge variant="outline" className="bg-primary/10">
              Выберите время окончания
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-primary/10">
              Выберите время начала
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Сначала выберите время начала, затем выберите время окончания.
                </p>
                <p>
                  Временной диапазон должен быть между 30 минутами и 4 часами.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div
          style={{
            height: selectedStartTime ? Math.max(previewHeight, 42) : 0,
          }}
          className="mr-[12px] transition-all duration-200"
        >
          {renderTimeDurationPreview()}
        </div>

        {["12", "24"].map((time) => (
          <TabsContent key={time} value={time}>
            <ScrollArea
              ref={scrollRef}
              type="always"
              className="h-full"
              style={{
                maxHeight: weeksInMonth > 5 ? "380px" : "320px",
              }}
            >
              <div className="grid grid-cols-1 gap-2 pr-3">
                {availableTimes.map((availableTime) => {
                  const timeValue = availableTime[time as "12" | "24"];
                  return (
                    <Button
                      variant="outline"
                      onClick={() => handleTimeSelection(timeValue)}
                      onMouseEnter={() => handleTimeHover(timeValue)}
                      onTouchStart={() => handleTimeHover(timeValue)}
                      onFocus={() => handleTimeButtonFocus(timeValue)}
                      onBlur={handleTimeButtonBlur}
                      key={timeValue}
                      className={cn(
                        "h-10 transition-colors duration-150",
                        getTimeButtonStyle(timeValue),
                      )}
                    >
                      {timeValue}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}

        {selectedStartTime && (
          <div className="mt-2 rounded-md border border-primary/50 bg-primary/5 p-2 text-sm">
            <p className="font-medium text-foreground">
              От: {selectedStartTime}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {window.matchMedia("(pointer: fine)").matches
                ? "Наведите на время, чтобы увидеть продолжительность, затем нажмите, чтобы подтвердить ваш выбор."
                : "Нажмите на время окончания, чтобы завершить выбор."}
            </p>
          </div>
        )}

        {selectedStartTime && (
          <Button
            variant="ghost"
            className="mt-1 text-sm text-destructive"
            onClick={() => {
              setSelectedStartTime(null);
              setHoverTime(null);
              setSelectionMode("start");
            }}
          >
            × Отменить выбор
          </Button>
        )}
      </Tabs>
    </>
  );
}
