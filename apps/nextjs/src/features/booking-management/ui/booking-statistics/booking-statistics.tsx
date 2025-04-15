"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookIcon,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Progress } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

interface BookingStatProps {
  title: string;
  value: number;
  change: number;
  changeText: string;
  icon: React.ReactNode;
}

function BookingStat({
  title,
  value,
  change,
  changeText,
  icon,
}: BookingStatProps) {
  const isPositive = change >= 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="px-4 pb-2 sm:px-6">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <div className="rounded-full bg-muted p-1.5">{icon}</div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {isPositive ? (
            <TrendingUpIcon className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <TrendingDownIcon className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : "-"}
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">{changeText}</span>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-3 pt-0 sm:px-6">
        <Progress value={change} className="relative w-full" />
      </CardFooter>
    </Card>
  );
}

interface BookingStatisticsProps {
  todayBookings: number;
  todayChange: number;
  monthlyBookings: number;
  monthlyChange: number;
}

export function BookingStatistics({
  todayBookings = 42,
  todayChange = 15,
  monthlyBookings = 829,
  monthlyChange = 10,
}: BookingStatisticsProps) {
  const router = useRouter();

  const handleCreateBooking = () => {
    router.push("/admin/bookings/create");
  };

  return (
    <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-4">
      <Card className="xs:col-span-2">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <BookIcon className="h-5 w-5" />
            Бронирования
          </CardTitle>
          <CardDescription className="max-w-lg text-balance text-sm leading-relaxed sm:text-base">
            Управляйте бронированиями, создавайте новые и анализируйте
            использование рабочих мест
          </CardDescription>
        </CardHeader>
        <CardFooter className="px-4 sm:px-6">
          <Button onClick={handleCreateBooking} className="w-full xs:w-auto">
            <PlusIcon className="mr-1 h-4 w-4" />
            Создать новое бронирование
          </Button>
        </CardFooter>
      </Card>

      <BookingStat
        title="Сегодня"
        value={todayBookings}
        change={todayChange}
        changeText="по сравнению со вчера"
        icon={<BookIcon className="h-4 w-4" />}
      />

      <BookingStat
        title="Этот месяц"
        value={monthlyBookings}
        change={monthlyChange}
        changeText="по сравнению с прошлым"
        icon={<BookIcon className="h-4 w-4" />}
      />
    </div>
  );
}
