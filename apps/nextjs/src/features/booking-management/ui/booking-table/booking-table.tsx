import React from "react";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import type { TBooking } from "~/entities/booking/model/booking.types";
import {
  formatDateTimestamp as formatDate,
  formatDateRangeTimestamp as formatDateRange,
} from "~/utils/format";

interface BookingTableProps {
  bookings: TBooking[];
  onRowClick?: (bookingId: string) => void;
  selectedBookingId?: string;
}

export function BookingTable({
  bookings,
  onRowClick,
  selectedBookingId,
}: BookingTableProps) {
  console.log(bookings);
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">Бронирований не найдено</p>
      </div>
    );
  }

  // Mobile card view for small screens
  const renderMobileView = () => {
    return (
      <div className="grid gap-3 sm:hidden">
        {bookings.map((booking) => {
          const isActive = booking.time_to > Date.now();
          const isSelected = booking.id === selectedBookingId;

          return (
            <div
              key={booking.id}
              className={`rounded-lg border p-3 ${isActive ? "bg-accent/50" : ""} ${isSelected ? "bg-primary/10" : ""} ${onRowClick ? "cursor-pointer hover:bg-accent" : ""}`}
              onClick={onRowClick ? () => onRowClick(booking.id) : undefined}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{booking.user.name}</span>
                </div>
                <Badge
                  className="text-xs"
                  variant={isActive ? "secondary" : "outline"}
                >
                  {isActive
                    ? "Активно"
                    : booking.time_to < Date.now()
                      ? "Завершено"
                      : "Отменено"}
                </Badge>
              </div>

              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{booking.entity.title}</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDate(booking.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {formatDateRange(booking.time_from, booking.time_to)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Table view for larger screens
  const renderTableView = () => {
    return (
      <div className="hidden rounded-md border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead className="hidden sm:table-cell">Тип места</TableHead>
              <TableHead className="hidden sm:table-cell">Статус</TableHead>
              <TableHead className="hidden md:table-cell">Дата</TableHead>
              <TableHead className="text-right">Время</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const isActive = booking.time_to > Date.now();
              const isSelected = booking.id === selectedBookingId;

              return (
                <TableRow
                  key={booking.id}
                  className={`${isActive ? "bg-accent/50" : ""} ${isSelected ? "bg-primary/10" : ""} ${onRowClick ? "cursor-pointer hover:bg-accent" : ""}`}
                  onClick={
                    onRowClick ? () => onRowClick(booking.id) : undefined
                  }
                >
                  <TableCell>
                    <div className="font-medium">{booking.user.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {booking.entity.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      className="text-xs"
                      variant={isActive ? "secondary" : "outline"}
                    >
                      {isActive
                        ? "Активно"
                        : booking.time_to < Date.now()
                          ? "Завершено"
                          : "Отменено"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(booking.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="whitespace-nowrap">
                      {formatDateRange(booking.time_from, booking.time_to)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <>
      {renderMobileView()}
      {renderTableView()}
    </>
  );
}
