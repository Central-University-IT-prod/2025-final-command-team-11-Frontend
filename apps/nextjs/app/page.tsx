import { redirect } from "next/navigation";

import { auth } from "@acme/api/auth";

import { GetJWTBody } from "~/shared/utils/jwt";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const { role } = GetJWTBody(session.tokens.accessToken);

  if (role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/client");
}
