import { redirect } from "next/navigation";

import { auth } from "@acme/api/auth";

export default async function ClientLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      {children}
      {modal}
    </>
  );
}
