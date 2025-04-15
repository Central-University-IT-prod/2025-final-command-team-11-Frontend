import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@acme/api/auth";

import { BookingView } from "~/features/client-booking/ui/booking-view";

export default async function ClientBookingPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Suspense>
        <div className="h-8"></div>
        <div className="flex w-full flex-col items-start space-y-4 sm:w-fit">
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Создание бронирования</h1>
            <p className="text-sm text-muted-foreground">
              Выберите дату и время для бронирования
            </p>
          </div>
          <BookingView className="mx-auto w-full" />
        </div>
      </Suspense>
    </div>
  );
}
