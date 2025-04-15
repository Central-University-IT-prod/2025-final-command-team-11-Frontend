import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@acme/api/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@acme/ui/breadcrumb";
import { Separator } from "@acme/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@acme/ui/sidebar";

import type { TAccount } from "~/entities/account/model/account.types";
import { GetJWTBody } from "~/shared/utils/jwt";
import { AdminSidebar } from "./ui/admin-sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const { role } = GetJWTBody(session.tokens.accessToken);

  if (role !== "ADMIN") {
    redirect("/auth/login");
  }

  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "/";

  const pathSegments = pathname.split("/").filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const currentPage =
    pathSegments.length > 0
      ? formatSegment(pathSegments[pathSegments.length - 1] ?? "")
      : "Главная";

  return (
    <SidebarProvider>
      <AdminSidebar account={session.user as TAccount} />
      <SidebarInset>
        <header className="border-b p-3">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Админ панель</BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.length > 1 &&
                  pathSegments.slice(0, -1).map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                    return (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem
                          key={segment}
                          className="hidden md:block"
                        >
                          <BreadcrumbLink href={href}>
                            {formatSegment(segment)}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    );
                  })}

                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
