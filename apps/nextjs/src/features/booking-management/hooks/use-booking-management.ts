import { useMemo } from "react";

import { $bookingApi } from "@acme/api";
import { useSession } from "@acme/api/auth";
import { toast } from "@acme/ui/toast";

import type { TAccount } from "~/entities/account/model/account.types";
import type { TBooking } from "~/entities/booking/model/booking.types";
import { dateToUnixTimestamp } from "~/utils/format";

export const useUserBookings = (_userId?: string) => {
  const {
    data: rawBookings,
    isLoading,
    error,
  } = $bookingApi.useQuery(
    "get",
    "/bookings/my",
    {},
    { refetchInterval: 5000, refetchIntervalInBackground: true },
  );

  const updateBookingMutation = $bookingApi.useMutation(
    "patch",
    "/bookings/{bookingId}",
    {
      onSuccess: () => {
        toast.success("Booking updated successfully");
      },
    },
  );
  const bookings = useMemo(
    () =>
      (Array.isArray(rawBookings) ? rawBookings : []) as unknown as TBooking[],
    [rawBookings],
  );

  const now = dateToUnixTimestamp(new Date());
  const weekStart = now - 7 * 24 * 60 * 60;
  const monthStart = now - 30 * 24 * 60 * 60;
  const yearStart = now - 365 * 24 * 60 * 60;

  const weeklyBookings = useMemo(
    () => bookings.filter((booking) => booking.created_at >= weekStart),
    [bookings, weekStart],
  );

  const monthlyBookings = useMemo(
    () => bookings.filter((booking) => booking.created_at >= monthStart),
    [bookings, monthStart],
  );

  const yearlyBookings = useMemo(
    () => bookings.filter((booking) => booking.created_at >= yearStart),
    [bookings, yearStart],
  );

  return {
    bookings,
    weeklyBookings,
    monthlyBookings,
    yearlyBookings,
    isLoading,
    error,
  };
};

export const useBooking = (bookingId?: string) => {
  const {
    data: booking,
    isLoading,
    error,
  } = $bookingApi.useQuery(
    "get",
    "/bookings/{bookingId}",
    {
      params: {
        path: {
          bookingId: bookingId ?? "",
        },
      },
    },
    {
      enabled: !!bookingId,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  );
  

  const mappedBooking = useMemo(() => {
    if (!booking) return undefined;

    return {
      id: booking.id,
      entity_id: booking.entity.id,
      user_id: booking.user.id,
      time_from: booking.time_from,
      time_to: booking.time_to,
      orders: booking.orders,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    } as TBooking;
  }, [booking]);

  return {
    booking: mappedBooking,
    isLoading,
    error,
  };
};

export const useBookingMutations = () => {
  const createBookingMutation = $bookingApi.useMutation(
    "post",
    "/bookings/admin/{userId}",
    {
      onError: (error) => {
        toast.error("Error creating booking", {
          description: (error as { message: string }).message,
        });
      },
      onSuccess: () => {
        toast.success("Booking created successfully");
      },
    },
  );

  const updateBookingMutation = $bookingApi.useMutation(
    "patch",
    "/bookings/{bookingId}",
    {
      onError: (error) => {
        toast.error("Error updating booking", {
          description: (error as { message: string }).message,
        });
      },
      onSuccess: () => {
        toast.success("Booking updated successfully");
      },
    },
  );
  const deleteBookingMutation = $bookingApi.useMutation(
    "delete",
    "/bookings/{bookingId}",
    {
      onError: (error) => {
        toast.error("Error deleting booking", {
          description: (error as { message: string }).message,
        });
      },
      onSuccess: () => {
        toast.success("Booking deleted successfully");
      },
    },
  );

  return {
    createBooking: createBookingMutation,
    updateBooking: updateBookingMutation,
    deleteBooking: deleteBookingMutation,
  };
};

export const useCurrentUser = () => {
  const { session } = useSession();

  const user: TAccount | undefined = useMemo(() => {
    if (!session) return undefined;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      verified: false,
    };
  }, [session]);

  return {
    user,
  };
};

export const useBookingManagement = ({ userId }: { userId?: string } = {}) => {
  const { user } = useCurrentUser();
  const {
    bookings,
    weeklyBookings,
    monthlyBookings,
    yearlyBookings,
    isLoading: isBookingsLoading,
  } = useUserBookings(userId);
  const { createBooking, updateBooking, deleteBooking } = useBookingMutations();

  console.log(bookings);

  const todayStart = dateToUnixTimestamp(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const yesterdayStart = todayStart - 24 * 60 * 60;
  const lastMonthStart = todayStart - 30 * 24 * 60 * 60;

  const todayBookings = bookings.filter(
    (b: TBooking) => b.created_at >= todayStart,
  ).length;
  const yesterdayBookings = bookings.filter(
    (b: TBooking) =>
      b.created_at >= yesterdayStart && b.created_at < todayStart,
  ).length;
  const thisMonthBookings = bookings.filter(
    (b: TBooking) => b.created_at >= lastMonthStart,
  ).length;
  const lastMonthBookings = bookings.filter(
    (b: TBooking) =>
      b.created_at >= lastMonthStart - 30 * 24 * 60 * 60 &&
      b.created_at < lastMonthStart,
  ).length;

  const todayChange = yesterdayBookings
    ? Math.round(
        ((todayBookings - yesterdayBookings) / yesterdayBookings) * 100,
      )
    : 0;
  const monthlyChange = lastMonthBookings
    ? Math.round(
        ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100,
      )
    : 0;

  return {
    currentUser: user,
    bookings,
    weeklyBookings,
    monthlyBookings,
    yearlyBookings,
    isLoading: isBookingsLoading,
    statistics: {
      todayBookings,
      todayChange,
      monthlyBookings: thisMonthBookings,
      monthlyChange,
    },
    mutations: {
      createBooking,
      updateBooking,
      deleteBooking,
    },
  };
};
