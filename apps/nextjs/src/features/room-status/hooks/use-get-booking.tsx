import { $adminApi } from "@acme/api";
import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";

export function useGetBooking(id: string) {
  const { isLoading, data: bookingEntityData, error } = $adminApi.useQuery("get", `/layout/entities/{id}`, { // RECODE TO NEW ROUTE!
    params: {
        path: {
            id: id,
        }
    }
  });
  
  return { isLoading, bookingEntityData: bookingEntityData as (TBookingEntity | undefined), error: error as string };
}