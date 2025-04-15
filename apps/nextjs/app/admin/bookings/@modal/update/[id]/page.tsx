import React from "react";

import { UpdateBookingModal } from "~/features/booking-management/ui/update-booking";

export default async function UpdateBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UpdateBookingModal bookingId={id} />;
}



