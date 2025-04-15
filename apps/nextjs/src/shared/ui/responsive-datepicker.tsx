"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@acme/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

import { CustomCalendar } from "./custom-calendar";

interface ResponsiveDatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  buttonClassName?: string;
  calendarClassName?: string;
  mobileBreakpoint?: number;
  label?: string;
  fromYear?: number;
  toYear?: number;
}

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export function ResponsiveDatePicker(props: ResponsiveDatePickerProps) {
  const {
    selected,
    onSelect,
    buttonClassName,
    calendarClassName,
    mobileBreakpoint = 768,
    label = "Select date",
    fromYear,
    toYear,
  } = props;

  const isMobile = useIsMobile(mobileBreakpoint);
  const [date, setDate] = React.useState<Date>(selected ?? new Date());
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const pickerContent = (
    <CustomCalendar
      className={calendarClassName}
      mode="single"
      selected={date}
      onSelect={(date) => {
        setDate(date ?? new Date());
        setIsOpen(false);
        onSelect?.(date ?? new Date());
      }}
      initialFocus
      fromYear={fromYear}
      toYear={toYear}
    />
  );

  const buttonContent = (
    <Button
      variant="outline"
      className={cn(
        "w-[280px] justify-start text-left",
        buttonClassName,
        !selected && "text-muted-foreground",
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {selected ? (
        format(selected, "PPP", { locale: ru })
      ) : (
        <span>{label}</span>
      )}
    </Button>
  );

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{buttonContent}</DrawerTrigger>
      <DrawerContent className="flex w-full flex-col items-center">
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        {pickerContent}
      </DrawerContent>
    </Drawer>
  ) : (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      <PopoverContent className="w-auto p-0">{pickerContent}</PopoverContent>
    </Popover>
  );
}
