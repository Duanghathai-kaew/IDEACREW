"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  onRowClick?: (row: T) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  emptyText?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  selectable = false,
  selectedIds = new Set<string>(),
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  page,
  totalPages,
  onPageChange,
  emptyText = "No data",
}: DataTableProps<T>) {
  const pageNumbers = React.useMemo(() => {
    const current = Math.max(1, page);
    const pages = new Set<number>([
      1,
      totalPages,
      current,
      current - 1,
      current + 1,
    ]);
    return Array.from(pages)
      .filter((num) => num > 0 && num <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

  const allChecked =
    rows.length > 0 && rows.every((row) => selectedIds.has(rowKey(row)));

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-11 text-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(event) =>
                      onToggleSelectAll?.(event.target.checked)
                    }
                    data-no-row-click="true"
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 bg-white"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "text-xs font-semibold text-slate-600 uppercase tracking-wider",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-8 text-center text-slate-500"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const key = rowKey(row);
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "border-b border-slate-100",
                      onRowClick
                        ? "cursor-pointer hover:bg-slate-50 transition-colors"
                        : "",
                    )}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("[data-no-row-click='true']")) return;
                      onRowClick?.(row);
                    }}
                  >
                    {selectable ? (
                      <TableCell
                        className="w-11 text-center"
                        data-no-row-click="true"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(key)}
                          onChange={(event) =>
                            onToggleSelect?.(key, event.target.checked)
                          }
                          className="h-4 w-4 cursor-pointer rounded border-slate-300"
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {pageNumbers.map((num) => (
            <Button
              key={num}
              type="button"
              variant={num === page ? "outline" : "ghost"}
              size="sm"
              onClick={() => onPageChange(num)}
              className={cn(
                "min-w-8 h-8",
                num === page
                  ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {num}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="text-slate-500 hover:text-slate-700"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
