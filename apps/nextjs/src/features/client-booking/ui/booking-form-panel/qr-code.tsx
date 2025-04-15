"use client";

import { Calendar, Check, Clock, MapPin, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useSession } from "@acme/api/auth";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

interface QRCodeProps {
  bookingId: string;
  entityName: string;
  timeFrom: Date;
  timeTo: Date;
}

export function QRCode({
  bookingId,
  entityName,
  timeFrom,
  timeTo,
}: QRCodeProps) {
  const { session } = useSession();
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-muted/10 pb-2 sm:pb-4">
        <div className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">
            Booking Confirmed
          </CardTitle>
          <Badge
            variant="outline"
            className="ml-auto border-primary/20 bg-primary/5 text-primary"
          >
            <Check className="mr-1 h-3 w-3" /> Confirmed
          </Badge>
        </div>
        <CardDescription className="mt-1 text-xs sm:text-sm">
          Show this QR code at reception to verify your booking
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center bg-background/50">
        <div className="mb-3 rounded-md border bg-white p-1 shadow-sm sm:mb-4">
          <QRCodeSVG
            value={session?.user.id ?? ""}
            className="z-20 size-full rounded-lg"
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            marginSize={4}
            size={200}
          />
        </div>
        <div className="w-full space-y-3">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{entityName}</p>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">{formatDate(timeFrom)}</p>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {formatTime(timeFrom)} - {formatTime(timeTo)}
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center border-t border-border/30 pt-2 text-sm">
                  <QrCode className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="font-mono text-xs">
                    ID: {bookingId.substring(0, 8)}...
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Full booking ID: {bookingId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/20 bg-muted/5 pt-3">
        <Button variant="outline" size="sm" className="text-xs">
          Add to Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}
