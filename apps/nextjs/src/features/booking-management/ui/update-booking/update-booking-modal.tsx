"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { UpdateBookingForm } from "./update-booking-form";

export function UpdateBookingModal({ bookingId }: { bookingId: string }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleSuccess = () => {
    router.back();
    router.refresh();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[650px]">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between">
          <div>
            <DialogTitle>Обновить бронирование</DialogTitle>
            <DialogDescription>
              Заполните форму для изменения нового бронирования
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-1 py-2">
          <UpdateBookingForm bookingId={bookingId} onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
