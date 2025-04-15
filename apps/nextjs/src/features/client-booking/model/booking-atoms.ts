import type { CalendarDate } from "@internationalized/date";
import { getLocalTimeZone, today } from "@internationalized/date";
import { atom } from "jotai";

import type { BookingStep } from "./booking-step.types";
import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import type { Guest } from "~/entities/booking/model/booking.types";

// Create atoms with persistence
export const bookingStepAtom = atom<BookingStep>("selection");

export const bookingDateAtom = atom<CalendarDate>(today(getLocalTimeZone()));

export const bookingFocusedDateAtom = atom<CalendarDate | null>(
  today(getLocalTimeZone()),
);

export const bookingTimeFromAtom = atom<string | null>(null);

export const bookingTimeToAtom = atom<string | null>(null);

export const bookingSelectedFloorIdAtom = atom<string>("");

export const bookingSelectedEntityAtom = atom<TBookingEntity | null>(null);

export const bookingGuestsAtom = atom<Guest[]>([]);

export const bookingOrdersAtom = atom<string[]>([]);

// Derived atoms
export const bookingTimeFromDateAtom = atom<Date | null>((get) => {
  const timeFrom = get(bookingTimeFromAtom);
  return timeFrom ? new Date(timeFrom) : null;
});

export const bookingTimeToDateAtom = atom<Date | null>((get) => {
  const timeTo = get(bookingTimeToAtom);
  return timeTo ? new Date(timeTo) : null;
});
export const bookingIdAtom = atom<string>("");

export const selectedUserIdAtom = atom<string>("");
