"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  Loader2,
  SearchIcon,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { Input } from "@acme/ui/input";
import { ScrollArea } from "@acme/ui/scroll-area";

import { useBookingManagement } from "../hooks/use-booking-management";
import { BookingDetails } from "./booking-details";
import { BookingEditModal } from "./booking-edit-modal/booking-edit-modal";
import { BookingStatistics } from "./booking-statistics";
import { BookingTabs } from "./booking-tabs";

const BookingLoadingSkeleton = () => (
  <div className="flex min-h-[calc(100vh-10rem)] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-lg">Загружаем бронирования...</span>
  </div>
);

export function BookingManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    bookings,
    weeklyBookings,
    monthlyBookings,
    yearlyBookings,
    statistics,
    currentUser,
    mutations,
    isLoading,
  } = useBookingManagement();

  const filteredWeeklyBookings = useMemo(() => {
    if (!searchQuery.trim()) return weeklyBookings;

    const query = searchQuery.toLowerCase();
    return weeklyBookings.filter((booking) => {
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.entity_id.toLowerCase().includes(query) ||
        booking.user.name.toLowerCase().includes(query)
      );
    });
  }, [weeklyBookings, searchQuery]);

  const filteredMonthlyBookings = useMemo(() => {
    if (!searchQuery.trim()) return monthlyBookings;

    const query = searchQuery.toLowerCase();
    return monthlyBookings.filter((booking) => {
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.entity_id.toLowerCase().includes(query) ||
        booking.user.name.toLowerCase().includes(query)
      );
    });
  }, [monthlyBookings, searchQuery]);

  const filteredYearlyBookings = useMemo(() => {
    if (!searchQuery.trim()) return yearlyBookings;

    const query = searchQuery.toLowerCase();
    return yearlyBookings.filter((booking) => {
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.entity_id.toLowerCase().includes(query) ||
        booking.user_id.toLowerCase().includes(query)
      );
    });
  }, [yearlyBookings, searchQuery]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  }, [bookings, selectedBookingId]);

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);

    if (window.innerWidth < 768) {
      setIsDrawerOpen(true);
    }
  };

  const handlePreviousBooking = () => {
    if (!selectedBookingId || bookings.length === 0) return;

    const currentIndex = bookings.findIndex((b) => b.id === selectedBookingId);
    if (currentIndex > 0) {
      setSelectedBookingId(bookings[currentIndex - 1]?.id ?? null);
    }
  };

  const handleNextBooking = () => {
    if (!selectedBookingId || bookings.length === 0) return;

    const currentIndex = bookings.findIndex((b) => b.id === selectedBookingId);
    if (currentIndex < bookings.length - 1) {
      setSelectedBookingId(bookings[currentIndex + 1]?.id ?? null);
    }
  };

  const handleEditBooking = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleCreateBooking = () => {
    router.push("/admin/bookings/create");
  };

  const handleDeleteBooking = (bookingId: string) => {
    void mutations.deleteBooking.mutateAsync({
      params: {
        path: {
          bookingId,
        },
      },
    });

    router.refresh();
  };

  const handleEditSuccess = () => {
    router.refresh();
  };

  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0]?.id ?? null);
    }
  }, [bookings, selectedBookingId]);

  if (isLoading) {
    return <BookingLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div className="flex-1">
          <h1 className="text-xl font-bold sm:text-2xl">
            Управление бронированиями
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Просмотр и управление бронированиями рабочих мест и комнат
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 sm:min-w-0 sm:flex-none">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск бронирований..."
              className="w-full pl-8 sm:w-auto md:w-[260px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" variant="outline" className="h-9 w-9 flex-none">
            <FilterIcon className="h-4 w-4" />
            <span className="sr-only">Фильтры</span>
          </Button>
          <Button
            className="ml-auto hidden flex-none sm:ml-0 sm:flex"
            onClick={handleCreateBooking}
          >
            <CalendarIcon className="mr-2 h-4 w-4" /> Новое бронирование
          </Button>
          <Button
            className="ml-auto flex-none sm:hidden"
            size="icon"
            onClick={handleCreateBooking}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Новое бронирование</span>
          </Button>
        </div>
      </div>

      <BookingStatistics
        todayBookings={statistics.todayBookings}
        todayChange={statistics.todayChange}
        monthlyBookings={statistics.monthlyBookings}
        monthlyChange={statistics.monthlyChange}
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3">
          <BookingTabs
            weeklyBookings={filteredWeeklyBookings}
            monthlyBookings={filteredMonthlyBookings}
            yearlyBookings={filteredYearlyBookings}
            onSelectBooking={handleSelectBooking}
            selectedBookingId={selectedBookingId ?? undefined}
          />
        </div>

        <div className="hidden md:block">
          {selectedBooking ? (
            <div className="sticky top-4">
              <BookingDetails
                booking={selectedBooking}
                handleDelete={handleDeleteBooking}
                user={
                  currentUser ?? {
                    id: "",
                    name: "",
                    email: "",
                    verified: false,
                  }
                }
                handleEdit={handleEditBooking}
                onPrevious={handlePreviousBooking}
                onNext={handleNextBooking}
                hasPrevious={
                  !!selectedBookingId &&
                  bookings.findIndex((b) => b.id === selectedBookingId) > 0
                }
                hasNext={
                  !!selectedBookingId &&
                  bookings.findIndex((b) => b.id === selectedBookingId) <
                    bookings.length - 1
                }
              />
            </div>
          ) : (
            <Card className="flex h-[70vh] items-center justify-center p-6">
              <div className="text-center">
                <ClockIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  Нет выбранного бронирования
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Выберите бронирование из списка слева для просмотра деталей
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {selectedBooking && (
        <Drawer open={isDrawerOpen} onOpenChange={handleCloseDrawer}>
          <DrawerContent className="max-h-[85vh] sm:max-w-[425px]">
            <DrawerHeader className="px-4 sm:px-6">
              <DrawerTitle>Детали бронирования</DrawerTitle>
              <DrawerDescription>
                Информация о выбранном бронировании
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="h-[75vh] px-4 sm:px-6">
              <BookingDetails
                handleDelete={handleDeleteBooking}
                booking={selectedBooking}
                user={selectedBooking.user}
                handleEdit={handleEditBooking}
                onPrevious={handlePreviousBooking}
                onNext={handleNextBooking}
                hasPrevious={
                  !!selectedBookingId &&
                  bookings.findIndex((b) => b.id === selectedBookingId) > 0
                }
                hasNext={
                  !!selectedBookingId &&
                  bookings.findIndex((b) => b.id === selectedBookingId) <
                    bookings.length - 1
                }
              />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      )}

      {selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
