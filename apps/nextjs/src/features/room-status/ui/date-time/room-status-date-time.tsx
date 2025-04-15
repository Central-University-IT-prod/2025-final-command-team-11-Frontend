"use client"

import { useEffect, useState } from "react"

export function RoomStatusDateTime() {
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const currentMonth= () => {
    const monthIndex = time.getMonth()

    const MonthsGenitive = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ]

    return MonthsGenitive[monthIndex]
  }

  const formattedTime = time.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const formattedDate = `${time.getDate()} ${currentMonth()} ${time.getFullYear()}`

  return (
        <div className="flex mt-4 items-center justify-center space-x-4 text-2xl">
          <span className="text-4xl font-bold text-foreground">{formattedTime}</span>
          <span className="text-foreground">|</span>
          <span className="text-2xl text-foreground">{formattedDate}</span>
        </div>
  )
}

