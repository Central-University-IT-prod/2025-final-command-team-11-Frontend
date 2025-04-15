import type { AriaButtonProps } from "@react-aria/button";
import type { CalendarState } from "@react-stately/calendar";
import type { DOMAttributes, FocusableElement } from "@react-types/shared";
import { useDateFormatter } from "@react-aria/i18n";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "./calendar-button";

export function CalendarHeader({
  state,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
}: {
  state: CalendarState;
  calendarProps: DOMAttributes<FocusableElement>;
  prevButtonProps: AriaButtonProps<"button">;
  nextButtonProps: AriaButtonProps<"button">;
}) {
  const monthDateFormatter = useDateFormatter({
    month: "long",
    year: "numeric",
    timeZone: state.timeZone,
    localeMatcher: "lookup",
  });

  const parts = monthDateFormatter.formatToParts(
    state.visibleRange.start.toDate(state.timeZone),
  );

  const monthName = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";

  const shortMonthName =
    monthName.length > 6 ? `${monthName.substring(0, 6)}` : monthName;

  return (
    <div className="flex items-center pb-2 xs:pb-3 sm:pb-4">
      <VisuallyHidden>
        <h2>{calendarProps["aria-label"]}</h2>
      </VisuallyHidden>
      <h2
        aria-hidden
        className="align-center sm:text-md flex-1 text-xs font-bold text-muted-foreground xs:text-sm"
      >
        <span className="block sm:hidden">{shortMonthName}</span>
        <span className="hidden sm:inline">{monthName}</span>{" "}
        <span className="text-muted-foreground">{year}</span>
      </h2>
      <div className="flex space-x-1">
        <Button {...prevButtonProps}>
          <ChevronLeftIcon className="size-3 xs:size-3.5 sm:size-4" />
        </Button>
        <Button {...nextButtonProps}>
          <ChevronRightIcon className="size-3 xs:size-3.5 sm:size-4" />
        </Button>
      </div>
    </div>
  );
}
