"use client";

import { useState } from "react";
import { FileIcon, ListFilterIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import type { TBooking } from "~/entities/booking/model/booking.types";
import { BookingTable } from "../booking-table";

interface BookingTabsProps {
  weeklyBookings: TBooking[];
  monthlyBookings: TBooking[];
  yearlyBookings: TBooking[];
  onSelectBooking?: (bookingId: string) => void;
  selectedBookingId?: string;
}

export function BookingTabs({
  weeklyBookings,
  monthlyBookings,
  yearlyBookings,
  onSelectBooking,
  selectedBookingId,
}: BookingTabsProps) {
  const [activeFilters, setActiveFilters] = useState({
    active: true,
    cancelled: false,
    completed: false,
  });
  const [activeTab, setActiveTab] = useState<"week" | "month" | "year">("week");

  const filteredBookings = {
    week: weeklyBookings,
    month: monthlyBookings,
    year: yearlyBookings,
  };

  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  return (
    <Tabs
      defaultValue="week"
      value={activeTab}
      onValueChange={(value) =>
        setActiveTab(value as "week" | "month" | "year")
      }
      className="w-full"
    >
      <div className="mb-3 flex flex-col flex-wrap items-start justify-between gap-2 xs:flex-row xs:items-center">
        <TabsList className="h-9 w-full xs:w-auto">
          <TabsTrigger value="week" className="text-xs sm:text-sm">
            Неделя
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            Месяц
          </TabsTrigger>
          <TabsTrigger value="year" className="text-xs sm:text-sm">
            Год
          </TabsTrigger>
        </TabsList>
        <div className="flex w-full items-center justify-end gap-2 xs:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs sm:text-sm"
              >
                <ListFilterIcon className="h-3.5 w-3.5" />
                <span>Фильтр</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={activeFilters.active}
                onCheckedChange={() => toggleFilter("active")}
              >
                Активные
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.cancelled}
                onCheckedChange={() => toggleFilter("cancelled")}
              >
                Отмененные
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.completed}
                onCheckedChange={() => toggleFilter("completed")}
              >
                Завершенные
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs sm:text-sm"
          >
            <FileIcon className="h-3.5 w-3.5" />
            <span>Экспорт</span>
          </Button>
        </div>
      </div>
      <TabsContent value="week">
        <Card>
          <CardHeader className="px-4 py-4 sm:px-7 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">
              Бронирования за неделю
            </CardTitle>
            <CardDescription className="text-sm">
              Список бронирований за текущую неделю.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <BookingTable
              bookings={filteredBookings.week}
              onRowClick={onSelectBooking}
              selectedBookingId={selectedBookingId}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="month">
        <Card>
          <CardHeader className="px-4 py-4 sm:px-7 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">
              Бронирования за месяц
            </CardTitle>
            <CardDescription className="text-sm">
              Бронирования за текущий месяц.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <BookingTable
              bookings={filteredBookings.month}
              onRowClick={onSelectBooking}
              selectedBookingId={selectedBookingId}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="year">
        <Card>
          <CardHeader className="px-4 py-4 sm:px-7 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">
              Бронирования за год
            </CardTitle>
            <CardDescription className="text-sm">
              Бронирования за текущий год.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <BookingTable
              bookings={filteredBookings.year}
              onRowClick={onSelectBooking}
              selectedBookingId={selectedBookingId}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
