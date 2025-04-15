"use client"

import type { TimeBlock, FormatedTimeBlock } from "./types/room-status-schedule-types"
import type { TWorkload } from "~/entities/workload/model/workload.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@acme/ui/card"
import { Badge } from "@acme/ui/badge"
import { Separator } from "@acme/ui/separator"
import { Calendar, Clock } from "lucide-react"

interface RoomStatusScheduleProps {
  scheduleData: TWorkload[]
}

export function RoomStatusSchedule({ scheduleData = [] }: RoomStatusScheduleProps) {
  function formatTime(unixTime: number) {
    const date = new Date(unixTime * 1000 - 3 * 3600 * 1000)
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  function timeSpaces() {
    const timeBlocks: TimeBlock[] = []
    let currentBlock: TimeBlock | null = null

    for (let i = 0; i < scheduleData.length; i++) {
      const currentSlot = scheduleData[i]

      if (!currentSlot) continue

      if (currentBlock === null) {
        currentBlock = {
          startTime: currentSlot.time,
          endTime: 0,
          is_free: currentSlot.is_free,
        }
      } else {
        if (currentSlot.is_free !== currentBlock.is_free) {
          currentBlock.endTime = currentSlot.time
          timeBlocks.push(currentBlock)

          currentBlock = {
            startTime: currentSlot.time,
            endTime: 0,
            is_free: currentSlot.is_free,
          }
        }
      }

      if (i === scheduleData.length - 1) {
        currentBlock.endTime = currentSlot.time
      }
    }

    if (currentBlock) {
      currentBlock.endTime = scheduleData[scheduleData.length - 1]?.time 
      timeBlocks.push(currentBlock)
    }

    const bookedTimeBlocks = timeBlocks.filter((block) => !block.is_free)

    const formatedTimeBlocks: FormatedTimeBlock[] = bookedTimeBlocks.map((item: TimeBlock) => {
      return {
        startTime: formatTime(item.startTime),
        endTime: formatTime(item.endTime - 900), // -15min
        is_free: item.is_free,
      }
    })

    return formatedTimeBlocks
  }

  return (
    <Card className="flex-1 h-full m-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle className="text-xl font-semibold">Расписание на день</CardTitle>
        </div>
        <CardDescription>Доступность помещения на ближайшие 24 часа</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {timeSpaces().length > 0 ? (
          <div className="space-y-3">
            {timeSpaces().map((item) => (
              <div
                key={item.startTime}
                className="flex justify-between items-center rounded-md border border-border p-3 overflow-hidden relative"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-base font-semibold">
                    {item.startTime} - {item.endTime}
                  </div>
                </div>
                <Badge variant="destructive">Забронировано</Badge>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-4">Нет бронирований на ближайшие 24 часа</div>
        )}
      </CardContent>
    </Card>
  )
}

