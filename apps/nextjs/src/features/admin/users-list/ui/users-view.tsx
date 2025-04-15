"use client";

// Import the UsersTable component dynamically to avoid circular dependencies
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Filter, Mail, RefreshCw, UserCheck, Users, UserX } from "lucide-react";

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

import { usersGet } from "../api/users-get";

const UsersTable = dynamic(
  () => import("./user-table").then((mod) => mod.UsersTable),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  },
);

interface UserStatProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function UserStat({
  title,
  value,
  icon,
  description,
  variant = "default",
}: UserStatProps) {
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

export function UsersView() {
  const {
    data: userStats,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: () => usersGet(0, 10),
    select: (data) => {
      const users = Array.isArray(data.accounts) ? data.accounts : [];
      const total = users.length;
      const active = users.filter((user) => user.verified).length;
      const inactive = total - active;

      return { total, active, inactive };
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
            <p className="text-muted-foreground">
              Управление пользователями и их аккаунтами
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
          <UserStat
            title="Всего пользователей"
            value={userStats?.total ?? 0}
            icon={<Users className="h-4 w-4 text-blue-600" />}
            description="Общее количество пользователей в системе"
            variant="secondary"
          />
          <UserStat
            title="Активные"
            value={userStats?.active ?? 0}
            icon={<UserCheck className="h-4 w-4 text-green-600" />}
            description="Активные пользователи"
          />
          <UserStat
            title="Неактивные"
            value={userStats?.inactive ?? 0}
            icon={<UserX className="h-4 w-4 text-red-600" />}
            description="Неактивные пользователи"
            variant="destructive"
          />
        </div>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-xl">
              Информация о пользователях
            </CardTitle>
            <CardDescription>
              Основные данные о пользователях системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Верификация</p>
                  <Badge variant="outline" className="mt-1">
                    {userStats?.active ?? 0} подтвержденных пользователей
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Регистрация</p>
                  <Badge variant="outline" className="mt-1">
                    {userStats?.total ?? 0} зарегистрированных пользователей
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <div className="rounded-full bg-primary/10 p-1.5">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Активность</p>
                  <Badge variant="outline" className="mt-1">
                    {Math.round(
                      ((userStats?.active ?? 0) / (userStats?.total ?? 1)) *
                        100,
                    )}
                    % активных пользователей
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="mt-2">
          <TabsList>
            <TabsTrigger value="all">Все пользователи</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="inactive">Неактивные</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-2">
            <UsersTable />
          </TabsContent>
          <TabsContent value="active" className="mt-2">
            <UsersTable />
          </TabsContent>
          <TabsContent value="inactive" className="mt-2">
            <UsersTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
