import type { CalendarDate } from "@internationalized/date";
import type { CalendarState } from "@react-stately/calendar";
import { useRef } from "react";
import {
  getLocalTimeZone,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import { useCalendarCell } from "@react-aria/calendar";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";

import { cn } from "@acme/ui";

export function CalendarCell({
  state,
  date,
  currentMonth,
}: {
  state: CalendarState;
  date: CalendarDate;
  currentMonth: CalendarDate;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { cellProps, buttonProps, isSelected, isDisabled, formattedDate } =
    useCalendarCell({ date }, state, ref);

  const isOutsideMonth = !isSameMonth(currentMonth, date);

  const isDateToday = isToday(date, getLocalTimeZone());

  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...cellProps}
      className={cn(
        "relative p-0.5 xs:p-0.5 sm:px-0.5 sm:py-0.5",
        isFocusVisible ? "z-10" : "z-0",
      )}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideMonth}
        className="group size-8 rounded-md outline-none xs:size-10 sm:size-12 md:size-14"
      >
        <div
          className={cn(
            "flex size-full items-center justify-center rounded-md",
            "text-xs font-semibold text-foreground xs:text-sm",
            isDisabled
              ? isDateToday
                ? "cursor-default"
                : "cursor-default text-muted-foreground"
              : "cursor-pointer bg-background",
            // Focus ring, visible while the cell has keyboard focus.
            isFocusVisible &&
              "group-focus:z-2 ring-1 ring-primary ring-offset-1",
            // Darker selection background for the start and end.
            isSelected && "bg-primary text-primary-foreground",
            // Hover state for non-selected cells.
            !isSelected && !isDisabled && "hover:ring-2 hover:ring-primary",
          )}
        >
          {formattedDate}
          {isDateToday && (
            <div
              className={cn(
                "absolute bottom-3 left-1/2 size-1 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-accent xs:bottom-3 xs:size-1.5 sm:bottom-4",
                isSelected && "bg-primary-foreground",
              )}
            />
          )}
        </div>
      </div>
    </td>
  );
}
