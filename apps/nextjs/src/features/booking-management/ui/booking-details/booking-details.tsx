"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  MoreVerticalIcon,
  UserIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Separator } from "@acme/ui/separator";

import type { TAccount } from "~/entities/account/model/account.types";
import type { TBooking } from "~/entities/booking/model/booking.types";
import {
  formatDateTimestamp as formatDate,
  isTimestampInFuture,
  isTimestampInPast,
  timestampToISOString,
} from "~/utils/format";
import { useBookingMutations } from "../../hooks/use-booking-management";
import { toast } from "sonner";

interface BookingDetailsProps {
  booking: TBooking;
  user: TAccount;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  handleDelete?: (bookingId: string) => void;
  handleEdit?: () => void;
  handleConfirm?: () => void;
}

export function BookingDetails({
  booking,
  user,
  onPrevious,
  onNext,
  handleDelete,
  handleEdit,
  handleConfirm,
  hasPrevious = false,
  hasNext = false,
}: BookingDetailsProps) {
  const isActive = isTimestampInFuture(booking.time_to);

  const { deleteBooking } = useBookingMutations();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  function handleUpdate() {
    router.push("/admin/bookings/update/" + booking.id);
  }

  function handleDelete() {
    setOpenDeleteModal(true);
  }

  function handleCloseDeleteModal() {
    setOpenDeleteModal(false);
  }

  async function onDelete() {
    await deleteBooking.mutateAsync({ params: { path: { bookingId: booking.id } } });
    handleCloseDeleteModal();
    toast.success("Бронирование удалено");
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-wrap items-start space-y-2 bg-muted/50 px-4 pb-4 sm:px-6">
        <div className="grid gap-0.5">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            Бронирование {booking.entity.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs sm:text-sm">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDate(booking.created_at)}
          </CardDescription>
        </div>
        <div className="mt-2 flex items-start gap-1">
          <Button
            size="sm"
            variant={isActive ? "default" : "outline"}
            className="h-7 gap-1 text-xs sm:h-8 sm:text-sm"
          >
            <CheckCircleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="whitespace-nowrap">
              {isActive ? "Подтвердить" : "Обработано"}
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <MoreVerticalIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Меню</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleConfirm}>
                Отменить бронирование
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete?.(booking.id)}>
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="w-full px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
        <div className="grid gap-4 sm:gap-6">
          <div className="w-full">
            <h3 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">
              Детали бронирования
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Рабочее место</span>
                </div>
                <span className="text-xs font-medium sm:text-sm">
                  {booking.entity.title}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Время</span>
                </div>
                <span className="flex flex-wrap justify-end whitespace-nowrap text-xs font-medium sm:text-sm">
                  <div>c {formatDate(booking.time_from)}</div>
                  <div>по {formatDate(booking.time_to)}</div>
                </span>
              </li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">
              Информация о пользователе
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Имя</span>
                </div>
                <span className="text-xs font-medium sm:text-sm">
                  {user.name}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email</span>
                </div>
                <a
                  href={`mailto:${user.email}`}
                  className="text-xs font-medium text-primary hover:underline sm:text-sm"
                >
                  {user.email}
                </a>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Статус</span>
                </div>
                <Badge
                  className="text-xs"
                  variant={isActive ? "secondary" : "outline"}
                >
                  {isActive
                    ? "Активно"
                    : isTimestampInPast(booking.time_to)
                      ? "Завершено"
                      : "Отменено"}
                </Badge>
              </li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold sm:mb-3 sm:text-base">
              QR-код доступа
            </h3>
            <div className="flex flex-col items-center space-y-2">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-lg bg-muted p-2 sm:h-32 sm:w-32">
                <QRCodeSVG
                  value={`http://localhost:3000/booking/${booking.id}`}
                  className="z-20 size-full rounded-lg"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  marginSize={4}
                  size={256}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  QR-код
                </span>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Код доступа:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs font-semibold">
                  {"ACCESS" + booking.id}
                </code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 sm:px-6 sm:py-3">
        <div className="text-xs text-muted-foreground">
          Обновлено{" "}
          <time dateTime={timestampToISOString(booking.updated_at)}>
            {formatDate(booking.updated_at)}
          </time>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 sm:h-7 sm:w-7"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Предыдущее бронирование</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 sm:h-7 sm:w-7"
            onClick={onNext}
            disabled={!hasNext}
          >
            <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Следующее бронирование</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
