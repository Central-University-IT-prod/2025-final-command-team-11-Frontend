"use client";

import type { CalendarProps, DateValue } from "@react-aria/calendar";
import { createCalendar } from "@internationalized/date";
import { useCalendar } from "@react-aria/calendar";
import { useLocale } from "@react-aria/i18n";
import { useCalendarState } from "@react-stately/calendar";

import { cn } from "@acme/ui";

import { CalendarGrid } from "./calendar-grid";
import { CalendarHeader } from "./calendar-header";

export function Calendar(
  props: CalendarProps<DateValue> & { className?: string },
) {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    visibleDuration: { months: 1 },
    locale,
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(
    props,
    state,
  );

  return (
    <div
      {...calendarProps}
      className={cn(
        "w-full max-w-full overflow-hidden rounded-md text-gray-800",
        "min-w-[240px] xs:min-w-[260px] sm:min-w-[280px] md:min-w-[340px]",
        props.className,
      )}
    >
      <CalendarHeader
        state={state}
        calendarProps={calendarProps}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
      />
      <div className="flex justify-center">
        <CalendarGrid state={state} />
      </div>
    </div>
  );
}
