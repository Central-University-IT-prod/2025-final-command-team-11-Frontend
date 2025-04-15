"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  MapPinIcon,
  Plus,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useSession } from "@acme/api/auth";
import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Skeleton } from "@acme/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import type { TBooking } from "~/entities/booking/model/booking.types";
import {
  useBookingMutations,
  useUserBookings,
} from "~/features/booking-management/hooks/use-booking-management";
import { BookingEditModal } from "~/features/booking-management/ui/booking-edit-modal/booking-edit-modal";
import { dateToUnixTimestamp, formatDateRangeTimestamp } from "~/utils/format";

export default function ClientPage() {
  const router = useRouter();
  const { session } = useSession();
  const user = session?.user;
  const { bookings, isLoading } = useUserBookings();

  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const now = dateToUnixTimestamp(new Date());
  const upcomingBookings = bookings.filter(
    (booking) => booking.time_from > now,
  );
  const pastBookings = bookings.filter((booking) => booking.time_from <= now);

  const sortedUpcomingBookings = [...upcomingBookings].sort(
    (a, b) => a.time_from - b.time_from,
  );
  const sortedPastBookings = [...pastBookings].sort(
    (a, b) => b.time_from - a.time_from,
  );

  const handleNewBooking = () => {
    router.push("/client/booking");
  };

  const firstLetter = user?.name ? user.name[0] : "U";

  return (
    <div className="mx-auto my-auto w-fit px-4 py-6 md:px-6 md:py-8">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr] lg:grid-cols-[3fr_1fr] lg:gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Добро пожаловать!
            </h1>
            <p className="text-muted-foreground">
              Управляйте бронированиями и получайте доступ к рабочему
              пространству
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={handleNewBooking}
            >
              <Plus className="h-4 w-4" />
              <span>Новое бронирование</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
              onClick={() => setQrDialogOpen(true)}
            >
              <QrCode className="h-4 w-4" />
              <span>Мой QR-код</span>
            </Button>
          </div>

          <Tabs
            defaultValue="upcoming"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
              <TabsTrigger value="past">Прошедшие</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedUpcomingBookings.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                  <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Нет предстоящих бронирований
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Забронируйте пространство, чтобы увидеть его здесь
                  </p>
                  <Button className="mt-4" size="sm" onClick={handleNewBooking}>
                    Забронировать
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUpcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      refresh={() => router.refresh()}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedPastBookings.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                  <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Нет истории бронирований
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ваши прошлые бронирования будут отображаться здесь
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isPast
                      refresh={() => router.refresh()}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="order-first md:order-last">
          <Card className="sticky top-20 w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-start gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full text-start">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-medium">{user?.name}</p>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600"
                    >
                      Подтвержден
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="mt-2 w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Всего бронирований
                    </span>
                    <span className="font-medium">{bookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Активных</span>
                    <span className="font-medium">
                      {upcomingBookings.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ваш персональный QR-код</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="overflow-hidden rounded-xl border p-1 shadow-sm">
              <QRCodeSVG
                value={user?.id ?? ""}
                size={200}
                marginSize={4}
                className="rounded-lg"
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Покажите этот QR-код на стойке регистрации для доступа к вашему
              бронированию
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingCard({
  booking,
  isPast = false,
  refresh,
}: {
  booking: TBooking;
  isPast?: boolean;
  refresh: () => void;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateBooking } = useBookingMutations();

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    void updateBooking.mutateAsync({
      params: {
        path: {
          bookingId: booking.id,
        },
      },
      body: {
        time_from: booking.time_from,
        time_to: booking.time_to,
      },
    });
    refresh();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`relative overflow-hidden transition-all hover:shadow-md ${isPast ? "opacity-80" : ""}`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{booking.entity.title}</CardTitle>
              <Badge variant={isPast ? "outline" : "default"}>
                {booking.entity.type === "ROOM"
                  ? "Комната"
                  : "Открытое пространство"}
              </Badge>
            </div>
            <CardDescription>
              Этаж {booking.entity.floor_id.slice(-1)} • Вместимость:{" "}
              {booking.entity.capacity} чел.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative p-4 pt-0">
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>
                  {formatDateRangeTimestamp(booking.time_from, booking.time_to)}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ClockIcon className="mr-2 h-4 w-4" />
                <span>
                  {Math.round((booking.time_to - booking.time_from) / 60 / 60)}{" "}
                  часа
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPinIcon className="mr-2 h-4 w-4" />
                <span>
                  {booking.entity.type === "ROOM"
                    ? "Переговорная комната"
                    : "Рабочее пространство"}
                </span>
              </div>

              {!isPast && (
                <div className="absolute bottom-0 right-0 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="mb-4 mr-4 flex items-center gap-1"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BookingEditModal
        booking={booking}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
