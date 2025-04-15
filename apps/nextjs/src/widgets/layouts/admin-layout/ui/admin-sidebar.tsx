"use client";

import type * as React from "react";
import {
  BookMarked,
  Coffee,
  Map,
  QrCode,
  ScrollText,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

import type { TAccount } from "~/entities/account/model/account.types";
import { AdminMain } from "./admin-nav";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Бронирования",
      url: "/admin/bookings",
      icon: BookMarked,
    },
    {
      title: "Планировка этажей",
      url: "/admin/floor-plans",
      icon: Map,
    },
    {
      title: "Заказы",
      url: "/admin/orders",
      icon: ScrollText,
    },
    {
      title: "Пользователи",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Пропускная система",
      url: "/admin/verify",
      icon: QrCode,
    },
  ],
  navSecondary: [
    // {
    //   title: "Support",
    //   url: "#",
    //   icon: LifeBuoy,
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    // },
  ],
  projects: [
    // {
    //   name: "Downtown Office",
    //   url: "#",
    //   icon: Building,
    // },
    // {
    //   name: "Business Center",
    //   url: "#",
    //   icon: Building,
    // },
    // {
    //   name: "Tech Hub",
    //   url: "#",
    //   icon: Building,
    // },
  ],
};

export function AdminSidebar({
  account,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  account: TAccount;
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Coffee className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Coffies admin</span>
                  <span className="truncate text-xs">
                    Управление коворкингом
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser account={account} />
      </SidebarFooter>
    </Sidebar>
  );
}
