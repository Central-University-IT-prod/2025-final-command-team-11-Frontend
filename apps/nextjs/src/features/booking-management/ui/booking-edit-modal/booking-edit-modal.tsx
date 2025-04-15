import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { $bookingApi } from "@acme/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { toast } from "@acme/ui/toast";

import type { TBooking } from "~/entities/booking/model/booking.types";
import { formatDateTimestamp, unixTimestampToDate } from "~/utils/format";

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      options.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const bookingFormSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time_from: z.string().min(1, "Выберите время начала"),
  time_to: z.string().min(1, "Выберите время окончания"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingEditModalProps {
  booking: TBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingEditModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: BookingEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert timestamp to date and time parts
  const timestampToDateAndTime = (timestamp: number) => {
    const date = unixTimestampToDate(timestamp);

    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split("T")[0];

    // Format time as HH:MM, rounded to nearest 30 minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    const timeStr = `${hours.toString().padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;

    return { date: dateStr, time: timeStr };
  };

  // Initialize form with booking data
  const getDefaultValues = () => {
    if (!booking) return { date: "", time_from: "", time_to: "" };

    const fromDateTime = timestampToDateAndTime(booking.time_from);
    const toDateTime = timestampToDateAndTime(booking.time_to);

    return {
      date: fromDateTime.date,
      time_from: fromDateTime.time,
      time_to: toDateTime.time,
    };
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: getDefaultValues(),
  });

  const updateBookingMutation = $bookingApi.useMutation(
    "patch",
    "/bookings/{bookingId}",
    {
      onError: (_error) => {
        toast.error("Ошибка обновления", {
          description: "Не удалось обновить бронирование",
        });
      },
      onSuccess: () => {
        toast.success("Бронирование обновлено", {
          description: "Данные бронирования успешно обновлены",
        });
        onSuccess();
        onClose();
      },
    },
  );

  const onSubmit = async (data: BookingFormValues) => {
    if (!booking) return;

    setIsSubmitting(true);
    try {
      const [fromHours, fromMinutes] = data.time_from.split(":").map(Number);
      const [toHours, toMinutes] = data.time_to.split(":").map(Number);

      const fromDate = new Date(data.date);
      fromDate.setHours(fromHours ?? 0, fromMinutes ?? 0, 0, 0);

      const toDate = new Date(data.date);
      toDate.setHours(toHours ?? 0, toMinutes ?? 0, 0, 0);

      const timeFrom = Math.floor(fromDate.getTime() / 1000);
      const timeTo = Math.floor(toDate.getTime() / 1000);

      if (timeFrom >= timeTo) {
        toast.error("Ошибка", {
          description: "Время окончания должно быть позже времени начала",
        });
        setIsSubmitting(false);
        return;
      }

      await updateBookingMutation.mutateAsync({
        params: {
          path: {
            bookingId: booking.id,
          },
        },
        body: {
          time_from: timeFrom,
          time_to: timeTo,
        },
      });
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирование бронирования</DialogTitle>
          <DialogDescription>
            Измените детали бронирования для {booking?.entity.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Дата</FormLabel>
                    <FormControl>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                            )}
                          >
                            <CalendarIcon />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date, _b, _a, e) => {
                              e.preventDefault();
                              field.onChange(date?.toISOString() ?? "");
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="time_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время начала</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={isSubmitting}
                        >
                          <option value="">Выберите время</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`from-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время окончания</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          disabled={isSubmitting}
                        >
                          <option value="">Выберите время</option>
                          {TIME_OPTIONS.map((time) => (
                            <option key={`to-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {booking && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium">Текущее время бронирования:</p>
                  <p className="mt-1 text-muted-foreground">
                    С {formatDateTimestamp(booking.time_from)} по{" "}
                    {formatDateTimestamp(booking.time_to)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || updateBookingMutation.isPending}
              >
                {isSubmitting || updateBookingMutation.isPending
                  ? "Сохранение..."
                  : "Сохранить изменения"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
