import { Users } from "lucide-react"

interface RoomStatusTitleProps {
  title: string
  freePlaces: number
}

export function RoomStatusTitle({ title, freePlaces }: RoomStatusTitleProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0 items-start md:items-center bg-card p-4 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
        <Users className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-baseline gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">Всего мест:</p>
          <p className="text-xl font-bold text-foreground">{freePlaces}</p>
        </div>
      </div>
    </div>
  )
}

