import { QRCodeSVG } from "qrcode.react"
import { CornerRightUp } from "lucide-react"
import { Skeleton } from "@acme/ui/skeleton"
import { Card, CardContent, CardFooter } from "@acme/ui/card"
import { useTheme } from "next-themes"

interface RoomStatusProps {
  content?: string
  placeholder?: boolean
}
export function RoomStatusQrcode({ content = "", placeholder = false }: RoomStatusProps) {
  const { theme } = useTheme()

  const qrCodeColors = {
    light: { bg: "#ffffff", fg: "#000000" },
    dark: { bg: "#1f2937", fg: "#ffffff" },
  }

  const { bg, fg } = theme === "dark" ? qrCodeColors.dark : qrCodeColors.light

  return (
    <Card className="w-full md:w-auto mx-auto md:mx-4 shadow-sm">
      <CardContent className="flex items-center justify-center pt-6 pb-2">
        {!placeholder ? (
          <QRCodeSVG value={content} size={160} bgColor={bg} fgColor={fg} level={"Q"} includeMargin={false} />
        ) : (
          <Skeleton className="flex items-center justify-center h-40 w-40">
            <span className="text-muted-foreground">QR-код</span>
          </Skeleton>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pb-4">
        <div className="flex items-center gap-2 hover:underline cursor-pointer transition-colors">
          <p className="text-base font-medium">Забронировать</p>
          <CornerRightUp className="h-5 w-5" />
        </div>
      </CardFooter>
    </Card>
  )
}

