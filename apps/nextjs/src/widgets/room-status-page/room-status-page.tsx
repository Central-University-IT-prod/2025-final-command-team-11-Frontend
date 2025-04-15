"use client";

import Link from "next/link";

import { RoomStatusBar } from "~/features/room-status/ui/statusbar";
import { RoomStatusDateTime } from "~/features/room-status/ui/date-time";
import { RoomStatusTitle } from "~/features/room-status/ui/title";
import { RoomStatusQrcode } from "~/features/room-status/ui/qrcode";
import { RoomStatusSchedule } from "~/features/room-status/ui/schedule";
import { useGetBooking } from "~/features/room-status/hooks/use-get-booking";

import { useGetBookingSchedule } from "~/features/room-status/hooks/use-get-booking-schedule";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert"
import { Button } from "@acme/ui/button";

import { LoaderCircle, AlertCircle, LogIn  } from "lucide-react";
import { Card, CardContent } from "@acme/ui/card";

interface RoomStatusProps {
    id: string;
}

const currentHost = typeof window !== "undefined" ? window.location.origin : "";

export function RoomStatus({ id }: RoomStatusProps) {

    const { isLoading: bookingLoading, bookingEntityData: bookingData, error: bookingError } = useGetBooking(id);
    const { isLoading: scheduleLoading, scheduleData, nowIsFree } = useGetBookingSchedule(id);
    
    if (bookingError || (!bookingLoading && !bookingData)) {
        return (
            <div className="flex flex-col h-screen bg-accent">
                <div className="rounded-b-xl bg-background pb-4 shadow-xl">
                    <RoomStatusDateTime />
                </div>
                <div className="rounded-xl bg-background p-4 shadow-xl items-center justify-center m-auto ">
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full p-2">
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Ошибка загрузки данных</AlertTitle>
                          <AlertDescription>
                            <p className="mb-2">Проблема возникла по одной из причин:</p>
                            <ul className="list-disc pl-6 space-y-1">
                              <li>Отсутствует интернет-соединение</li>
                              <li>Неверный id</li>
                              <li>Пользователь не авторизован</li>
                              <li>Произошла ошибка на сервере</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        <div className="flex flex-col gap-2">
                            <Button asChild>
                              <Link href="/auth/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Авторизация
                              </Link>
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">roomId: { id }</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    } 

    else if (scheduleLoading || bookingLoading || !bookingData) 
        return (
            <div className="flex flex-col h-screen w-screen">
                <div className="rounded-b-xl bg-background pb-4 shadow-xl">
                    <RoomStatusDateTime />
                </div>
                <div className="flex h-full items-center justify-center">
                    <Card className="mx-auto mb-4 max-w-md">
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground mr-52">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          <p>Загрузка данных...</p>
                        </div>
                      </CardContent>
                    </Card>
                </div>
            </div>
    )

    else {
        return (
        <div className="flex flex-col h-screen bg-accent ">
            <div className="rounded-b-xl bg-background pb-4 shadow-xl">
                { bookingData.type === "ROOM" && <RoomStatusBar isBusy={!nowIsFree} />}
                <RoomStatusDateTime />
            </div>
            <div className="flex-1 rounded-xl p-4 shadow-xl dark:from-destructive flex flex-col ">
                <RoomStatusTitle title={bookingData.title} freePlaces={bookingData.capacity} />
                <div className="flex flex-1 items-center my-4">
                    <RoomStatusQrcode content={`${currentHost}/bookings/${bookingData.id}`} />
                    <RoomStatusSchedule scheduleData={scheduleData} />
                </div>
            </div>
        </div>
        );
    }
}
