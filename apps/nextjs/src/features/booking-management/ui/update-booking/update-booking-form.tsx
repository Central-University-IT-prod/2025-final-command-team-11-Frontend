"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { cn } from "@acme/ui"
import { Button } from "@acme/ui/button"
import { Calendar } from "@acme/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@acme/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@acme/ui/select"

import type { TCreateBooking } from "../../model/booking-management.types"
import { CreateBookingSchema } from "../../model/booking-management.schema"

import { useBooking } from "../../hooks/use-booking-management"
import { useBookingMutations } from "../../hooks/use-booking-management"

interface CreateBookingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  bookingId: string
}

interface FloorEntity {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export function UpdateBookingForm({ onSuccess, bookingId }: CreateBookingFormProps) {
  const router = useRouter()
  const { updateBooking } = useBookingMutations()
  const { booking, isLoading } = useBooking(bookingId)
  const [isFormReady, setIsFormReady] = useState(false)

  const form = useForm<TCreateBooking>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      entity_id: bookingId,
      date: new Date(),
      time_from: "09:00",
      time_to: "18:00",
    },
  })


  useEffect(() => {
    if (booking && !isLoading) {
      try {

        const bookingDate = new Date(booking.time_from * 1000)


        const timeFromHours = new Date(booking.time_from * 1000).getHours()
        const timeToHours = new Date(booking.time_to * 1000).getHours()

        const timeFromStr = `${timeFromHours.toString().padStart(2, "0")}:00`
        const timeToStr = `${timeToHours.toString().padStart(2, "0")}:00`

        form.reset({
          entity_id: booking.id,
          date: bookingDate,
          time_from: timeFromStr,
          time_to: timeToStr,
        })

        setIsFormReady(true)
      } catch (error) {
        console.error("Error setting form values:", error)
        toast.error("Ошибка при загрузке данных бронирования")
      }
    }
  }, [booking, isLoading, form])

  const onSubmit = async (values: TCreateBooking) => {
    if (!booking) {
      toast.error("Данные бронирования не найдены")
      return
    }


    const selectedDate = format(values.date, "yyyy-MM-dd")

    const timeFromDate = new Date(`${selectedDate}T${values.time_from}:00`)
    const timeToDate = new Date(`${selectedDate}T${values.time_to}:00`)

    if (timeFromDate >= timeToDate) {
      toast.error("Время начала должно быть раньше времени окончания")
      return
    }


    const timeFromUnix = Math.floor(timeFromDate.getTime() / 1000)
    const timeToUnix = Math.floor(timeToDate.getTime() / 1000)

    try {
      await updateBooking.mutateAsync({
        params: {
          path: {
            bookingId: booking.id,
          },
        },
        body: {
          time_from: timeFromUnix + 10800,
          time_to: timeToUnix + 10800,
        },
      })

      console.log("Updated booking with:", {
        id: booking.id,
        time_from: timeFromUnix,
        time_to: timeToUnix,
      })

      toast.success("Бронирование успешно обновлено")

      if (onSuccess) {
        onSuccess()
      } else {
        router.back()
      }
    } catch (error) {
      toast.error("Ошибка при обновлении бронирования")
      console.error(error)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking && !isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Бронирование не найдено</p>
        <Button onClick={() => router.back()} className="mt-4" variant="outline">
          Назад
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mt-0 space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата бронирования</FormLabel>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal")}>
                        {field.value ? format(field.value, "PPP", { locale: ru }) : "Выберите дату"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                      }
                      locale={ru}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="time_from"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Время начала</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                          {`${i.toString().padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_to"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Время окончания</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                          {`${i.toString().padStart(2, "0")}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormReady}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Обновить бронирование
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

