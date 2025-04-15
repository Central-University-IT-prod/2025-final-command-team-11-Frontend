"use client";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import * as React from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { $adminApi } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { toast } from "@acme/ui/toast";

import type { TOrder } from "../model/order.types";
import { ordersGet } from "../api/orders-get";
import { statuses } from "../constants";
import { OrderTableColumns } from "./order-table-columns";
import { OrdersTableFilter } from "./orders-table-filter";

export function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orders", pagination.pageIndex],
    queryFn: () => ordersGet(pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const table = useReactTable({
    data: orders ? (orders.orders as unknown as TOrder[]) : [],
    columns: OrderTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    rowCount: orders?.orders?.length,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  const { mutateAsync: mutateOrder, isPending } = $adminApi.useMutation(
    "post",
    "/orders/{id}",
    {
      onSuccess: () =>
        queryClient.refetchQueries({
          queryKey: ["admin-orders"],
        }),
      onError: (error) => {
        toast.error("Error completing order", {
          description: error.error,
        });
      },
    },
  );
  console.log(orders);
  if (isLoading)
    return (
      <div className="flex min-h-[calc(100vh-20rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Загружаем заказы...</span>
      </div>
    );
  if (!orders) return <div>Error</div>;
  if (isError) return <div>бекендпобеда.рф</div>;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 py-4">
        <OrdersTableFilter
          column={
            (orders.count ?? 0) > 0 ? table.getColumn("completed") : undefined
          }
          options={statuses}
          title="Статус"
        />
        <Button
          className="h-8"
          variant="outline"
          disabled={table.getSelectedRowModel().rows.length === 0 || isPending}
          onClick={async () => {
            await Promise.all(
              table.getSelectedRowModel().rows.map((row) => {
                if (row.original.id) return;
                return mutateOrder({
                  params: {
                    path: {
                      id: row.original.id,
                    },
                  },
                });
              }),
            );
            table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
          }}
        >
          Отметить как выполненные
        </Button>
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
                  colSpan={OrderTableColumns.length}
                  className="h-24 text-center"
                >
                  Нет заказов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-start space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} из{" "}
          {table.getFilteredRowModel().rows.length} заказов выбрано
        </div> */}
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
    </div>
  );
}
