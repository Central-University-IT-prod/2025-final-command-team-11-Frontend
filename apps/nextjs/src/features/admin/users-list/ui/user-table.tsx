"use client";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";

import type { TAccount } from "~/entities/account/model/account.types";
import { usersGet } from "../api/users-get";
import { UserEditModal } from "./user-edit-modal";
import { createUserTableColumns } from "./user-table-columns";
import { UsersTableFilter } from "./user-table-filter";

export function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [editingUser, setEditingUser] = React.useState<TAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleEditUser = (user: TAccount) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-users", pagination.pageIndex],
    queryFn: () => usersGet(pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const columns = React.useMemo(
    () => createUserTableColumns({ onEditUser: handleEditUser }),
    [],
  );

  const table = useReactTable({
    data: users?.accounts ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    rowCount: users?.count,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  if (isLoading)
    return (
      <div className="flex min-h-[calc(100vh-20rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Загружаем пользователей...</span>
      </div>
    );
  if (!users) return <div>Ошибка загрузки данных</div>;
  if (isError) return <div>Ошибка загрузки данных</div>;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 py-4">
        <UsersTableFilter
          column={
            users.accounts.length > 0 ? table.getColumn("email") : undefined
          }
          options={[
            { value: "verified", label: "Верифицирован", icon: undefined },
            { value: "unverified", label: "Не верифицирован", icon: undefined },
          ]}
          title="Статус почты"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-[50px]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Нет пользователей
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-start space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      <UserEditModal
        user={editingUser}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}

export default UsersTable;
