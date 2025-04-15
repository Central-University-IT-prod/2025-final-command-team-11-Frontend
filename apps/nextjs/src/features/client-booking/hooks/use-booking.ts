import type { CalendarDate, DateValue } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { getLocalTimeZone, getWeeksInMonth } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { useAtom } from "jotai";

import { $adminApi, $bookingApi } from "@acme/api";
import { toast } from "@acme/ui/toast";

import type { BookingStep } from "../model/booking-step.types";
import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import type { Guest } from "~/entities/booking/model/booking.types";
import {
  bookingDateAtom,
  bookingFocusedDateAtom,
  bookingGuestsAtom,
  bookingIdAtom,
  bookingOrdersAtom,
  bookingSelectedEntityAtom,
  bookingSelectedFloorIdAtom,
  bookingStepAtom,
  bookingTimeFromAtom,
  bookingTimeFromDateAtom,
  bookingTimeToAtom,
  bookingTimeToDateAtom,
} from "../model/booking-atoms";

export function useBooking() {
  const router = useRouter();
  const { locale } = useLocale();

  // Use Jotai atoms instead of localStorage
  const [currentStep, setCurrentStep] = useAtom(bookingStepAtom);
  const [date, setDate] = useAtom(bookingDateAtom);
  const [focusedDate, setFocusedDate] = useAtom(bookingFocusedDateAtom);
  const [_timeFromString, setTimeFromString] = useAtom(bookingTimeFromAtom);
  const [_timeToString, setTimeToString] = useAtom(bookingTimeToAtom);
  const [selectedFloorId, setSelectedFloorId] = useAtom(
    bookingSelectedFloorIdAtom,
  );
  const [selectedEntity, setSelectedEntity] = useAtom(
    bookingSelectedEntityAtom,
  );
  const [guests, setGuests] = useAtom(bookingGuestsAtom);
  const [orders, setOrders] = useAtom(bookingOrdersAtom);

  // Derived atoms
  const [timeFrom] = useAtom(bookingTimeFromDateAtom);
  const [timeTo] = useAtom(bookingTimeToDateAtom);

  const [bookingId, setBookingId] = useAtom(bookingIdAtom);

  const weeksInMonth = getWeeksInMonth(focusedDate as DateValue, locale);

  const createBookingMutation = $bookingApi.useMutation("post", "/bookings", {
    onSuccess: () => {
      toast.success("Booking created successfully");
      router.refresh();
    },
  });

  const createOrderMutation = $bookingApi.useMutation(
    "post",
    "/bookings/{bookingId}/orders",
    {
      onError: (error) => {
        toast.error("Error creating order", {
          description: (error as { message: string }).message,
        });
      },
      onSuccess: () => {
        toast.success("Order created successfully");
      },
    },
  );

  const inviteGuestMutation = $adminApi.useMutation(
    "post",
    "/booking/{id}/guests",
    {
      onError: (error) => {
        toast.error("Error inviting guest", {
          description: error.error,
        });
      },
      onSuccess: () => {
        toast.success("Guest invited successfully");
      },
    },
  );

  const processTimeToDate = (
    time: string,
    baseDate: DateValue,
  ): Date | null => {
    const timeValue = time.split(":").join(" ");
    const match = /^(\d{1,2}) (\d{2})([ap]m)?$/i.exec(timeValue);

    if (!match) {
      console.error("Invalid time format");
      return null;
    }

    let hours = Number.parseInt(match[1] ?? "0");
    const minutes = Number.parseInt(match[2] ?? "0");
    const isPM = match[3] && match[3].toLowerCase() === "pm";

    if (isPM && (hours < 1 || hours > 12)) {
      console.error("Time out of range (1-12) in 12-hour format");
      return null;
    }

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    const currentDate = baseDate.toDate(getLocalTimeZone());
    currentDate.setHours(hours, minutes);
    return currentDate;
  };

  const handleChangeStep = (step: BookingStep) => {
    setCurrentStep(step);
  };

  const handleChangeDate = (date: DateValue) => {
    setDate(date as CalendarDate);
    setCurrentStep("selection");
    setTimeFromString(null);
    setTimeToString(null);
    setSelectedEntity(null);
  };

  const handleChangeAvailableTime = (startTime: string, endTime: string) => {
    const startDatetime = processTimeToDate(startTime, date);
    const endDatetime = processTimeToDate(endTime, date);

    if (!startDatetime || !endDatetime) return;

    setTimeFromString(startDatetime.toISOString());
    setTimeToString(endDatetime.toISOString());
    setCurrentStep("map");
    setSelectedEntity(null);
  };

  const handleFloorSelect = (floorId: string) => {
    setSelectedFloorId(floorId);
  };

  const handleEntitySelect = async (entity: TBookingEntity) => {
    console.log("handleEntitySelect", entity);
    setSelectedEntity(entity);
    const booking = await createBookingMutation.mutateAsync(
      {
        body: {
          entity_id: entity.id,
          time_from: timeFrom?.getTime() ? timeFrom.getTime() / 1000 : 0,
          time_to: timeTo?.getTime() ? timeTo.getTime() / 1000 : 0,
        },
      },
      {
        onSuccess(data) {
          console.log("data", data);
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (data === undefined) {
            toast.error("Error creating booking", {
              description: "Conflict with another booking",
            });
          }
        },
        onError: (error) => {
          console.log("error", error);
          toast.error("Error creating booking", {
            description: (error as { message: string }).message,
          });
        },
      },
    );
    if (booking) {
      setBookingId(booking.id);
      setCurrentStep("qrcode");
    }
  };

  const handleChangeGuests = (guests: Guest[]) => {
    setGuests(guests);
    setCurrentStep("qrcode");
  };

  const handleChangeOrders = (orders: string[]) => {
    setOrders(orders);
    setCurrentStep("qrcode");
  };

  const resetBooking = () => {
    setCurrentStep("selection");
    setTimeFromString(null);
    setTimeToString(null);
    setSelectedEntity(null);
  };

  const goBack = () => {
    if (currentStep === "qrcode") {
      setCurrentStep("map");
    } else if (currentStep === "map") {
      setCurrentStep("selection");
      setTimeFromString(null);
      setTimeToString(null);
      setSelectedEntity(null);
    }
  };

  const formatSelectedDate = () => {
    if (!timeFrom) return "";

    return timeFrom.toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSelectedTimeRange = () => {
    if (!timeFrom || !timeTo) return "";

    return `${timeFrom.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} - ${timeTo.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  return {
    date,
    focusedDate,
    selectedFloorId,
    selectedEntity,
    timeFrom,
    timeTo,
    currentStep,
    guests,
    orders,
    weeksInMonth,

    handleChangeStep,
    handleChangeDate,
    handleChangeAvailableTime,
    handleFloorSelect,
    handleEntitySelect,
    createBookingMutation,
    createOrderMutation,
    inviteGuestMutation,
    handleChangeGuests,
    handleChangeOrders,
    bookingId,
    resetBooking,
    goBack,
    formatSelectedDate,
    formatSelectedTimeRange,
    setFocusedDate,
  };
}
