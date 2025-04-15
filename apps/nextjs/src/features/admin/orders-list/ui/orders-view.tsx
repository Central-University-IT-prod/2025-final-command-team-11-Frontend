"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  Filter,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import type { TOrder } from "../model/order.types";
import { ordersGet } from "../api/orders-get";
import { things } from "../constants";
import { OrdersTable } from "./orders-table";

interface OrderStatProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function OrderStat({
  title,
  value,
  icon,
  description,
  variant = "default",
}: OrderStatProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`rounded-full p-1.5 ${variant === "destructive" ? "bg-red-100" : variant === "secondary" ? "bg-blue-100" : "bg-green-100"}`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function OrdersView() {
  const {
    data: orderStats,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-orders-stats"],
    queryFn: () => ordersGet(0, 1000),
    select: (data) => {
      if (!data) return { total: 0, completed: 0, pending: 0 };

      const orders = Array.isArray(data) ? data : [];
      const total = orders.length;
      const completed = orders.filter(
        (order: TOrder) => order.completed,
      ).length;
      const pending = total - completed;

      return { total, completed, pending };
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Заказы</h1>
            <p className="text-muted-foreground">
              Управление заказами и отслеживание их статуса
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              disabled={isRefetching}
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Фильтры
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <OrderStat
            title="Всего заказов"
            value={orderStats?.total ?? 0}
            icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
            description="Общее количество заказов в системе"
            variant="secondary"
          />
          <OrderStat
            title="Выполненные"
            value={orderStats?.completed ?? 0}
            icon={<CircleCheck className="h-4 w-4 text-green-600" />}
            description="Заказы, которые были выполнены"
          />
          <OrderStat
            title="Ожидающие"
            value={orderStats?.pending ?? 0}
            icon={<CircleAlert className="h-4 w-4 text-red-600" />}
            description="Заказы, ожидающие выполнения"
            variant="destructive"
          />
        </div>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-xl">Типы заказов</CardTitle>
            <CardDescription>
              Распределение заказов по типам товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {things.map((thing) => (
                <div
                  key={thing.value}
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <thing.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{thing.label}</p>
                    <Badge variant="outline" className="mt-1">
                      <Clock className="mr-1 h-3 w-3" /> Среднее время: 15 мин
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="mt-2">
          <TabsList>
            <TabsTrigger value="all">Все заказы</TabsTrigger>
            <TabsTrigger value="pending">Ожидающие</TabsTrigger>
            <TabsTrigger value="completed">Выполненные</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-2">
            <OrdersTable />
          </TabsContent>
          <TabsContent value="pending" className="mt-2">
            <OrdersTable />
          </TabsContent>
          <TabsContent value="completed" className="mt-2">
            <OrdersTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
