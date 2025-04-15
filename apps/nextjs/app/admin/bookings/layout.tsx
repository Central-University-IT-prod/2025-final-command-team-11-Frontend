import React from "react";

interface BookingLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function BookingLayout({ children, modal }: BookingLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
