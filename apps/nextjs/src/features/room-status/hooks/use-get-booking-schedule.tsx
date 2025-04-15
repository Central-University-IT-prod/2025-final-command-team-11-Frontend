import { $bookingApi } from "@acme/api";
import type { TWorkload } from "~/entities/workload/model/workload.types";

export function useGetBookingSchedule(id: string) {

  const getRoundedTime = () => {
    const now = new Date()
    
    const minutes = now.getMinutes()

    const roundedMinutes = Math.floor(minutes / 15) * 15

    const roundedDate = new Date(now)
    roundedDate.setMinutes(roundedMinutes)
    roundedDate.setSeconds(0)
    roundedDate.setMilliseconds(0)

    const unixTimestamp = Math.floor(roundedDate.getTime() / 1000)
    return unixTimestamp + 10800 // +3h for MSK
  }

  const { isLoading, data: scheduleData, error } = $bookingApi.useQuery("get", `/workloads/{entityId}`, {
    params: {
      path: {
        entityId: id,
      },
      query: {
        timeFrom: getRoundedTime(), 
        timeTo: getRoundedTime() + 86400, // + 24h
      }
    },
  }, {retryDelay: 2000, staleTime: 5000, retry: 3 });
  
  const nowIsFree = (scheduleData?.some((item: { time: number; is_free: boolean }) => 
    item.time === getRoundedTime() && item.is_free
) ?? false);

  return { isLoading, scheduleData: scheduleData as TWorkload[], error: error as string, nowIsFree }; 
}