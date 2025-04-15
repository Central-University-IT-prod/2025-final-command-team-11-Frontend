import type { Metadata, Viewport } from "next";

import { AdminLayout } from "~/widgets/layouts/admin-layout/admin-layout";

import "~/app/styles/globals.css";

import { redirect } from "next/navigation";

import { auth } from "@acme/api/auth";

import { env } from "~/app/config/env";
import { GetJWTBody } from "~/shared/utils/jwt";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Create T3 Turbo",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootAdminLayout(props: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }
  const { role } = GetJWTBody(session.tokens.accessToken);
  if (role !== "ADMIN") {
    redirect("/auth/login");
  }
  return <AdminLayout>{props.children}</AdminLayout>;
}
