import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Mail, MoreHorizontal, User } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toast";

import type { TAccount } from "~/entities/account/model/account.types";

interface UserTableColumnsProps {
  onEditUser: (user: TAccount) => void;
}

export const createUserTableColumns = ({
  onEditUser,
}: UserTableColumnsProps): ColumnDef<TAccount>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Имя
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "ID пользователя",
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return isActive ? (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Верифицирован
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Не верифицирован
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(user.id);
                toast.success("Скопировано в буфер обмена");
              }}
            >
              Копировать ID пользователя
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              Редактировать пользователя
            </DropdownMenuItem>
            <DropdownMenuItem>Удалить пользователя</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
