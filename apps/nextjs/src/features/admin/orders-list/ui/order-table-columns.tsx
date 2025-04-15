import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import type { TOrder } from "../model/order.types";
import { things } from "../constants";
import ThingIcon from "../lib/thing-icon";

export const OrderTableColumns: ColumnDef<TOrder>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Статус
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{row.getValue("status") ? "Выполнен" : "Не выполнен"}</div>
    ),
  },
  {
    accessorKey: "thing",
    header: "Заказ",
    cell: ({ row }) => {
      const thing = things.find(
        (thing) => thing.value === row.getValue("thing"),
      );
      return (
        <div className="flex gap-2">
          {thing && <ThingIcon thing={thing} className="size-5" />}
          {thing?.label}
        </div>
      );
    },
  },
  {
    accessorKey: "create_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="float-right"
      >
        Время заказа
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {new Date(Number(row.getValue("create_at")) * 1000).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "thing",
    header: () => <div className="text-right">Название</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("thing")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Копировать ID заказа
            </DropdownMenuItem>
            <DropdownMenuItem>Удалить заказ</DropdownMenuItem>
            <DropdownMenuItem>Отметить как выполненный</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Просмотр аренды</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
