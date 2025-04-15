import type { DateDuration } from "@internationalized/date";
import type { CalendarState } from "@react-stately/calendar";
import { endOfMonth, getWeeksInMonth } from "@internationalized/date";
import { useCalendarGrid } from "@react-aria/calendar";
import { useLocale } from "@react-aria/i18n";

import { cn } from "@acme/ui";

import { CalendarCell } from "./calendar-cell";

export function CalendarGrid({
  state,
  offset = {},
}: {
  state: CalendarState;
  offset?: DateDuration;
}) {
  const { locale } = useLocale();
  const startDate = state.visibleRange.start.add(offset);
  const endDate = endOfMonth(startDate);
  const { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      endDate,
      weekdayStyle: "short",
    },
    state,
  );

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <table
      {...gridProps}
      cellPadding="0"
      className={cn(
        "w-full border-separate border-spacing-1",
        "min-w-[220px] xs:min-w-[240px] sm:min-w-[280px] md:min-w-[320px]",
      )}
    >
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={index}
              className="pb-1 text-center text-[9px] uppercase text-muted-foreground xs:pb-2 xs:text-xs sm:pb-3 sm:text-xs md:pb-4"
            >
              {day.slice(0, 2)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state.getDatesInWeek(weekIndex, startDate).map((date, index) => {
              if (!date) {
                return <td key={index} />;
              }

              return (
                <CalendarCell
                  key={index}
                  state={state}
                  date={date}
                  currentMonth={startDate}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
