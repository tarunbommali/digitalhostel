import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface ColumnDef<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface PaginationConfig {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  pagination?: PaginationConfig;
  filters?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  loading = false,
  emptyState,
  pagination,
  filters,
  rowActions,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs overflow-hidden ${className}`}
    >
      {filters && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/40 flex flex-wrap items-center justify-between gap-3">
          {filters}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[var(--color-border)] bg-[var(--color-surface-sunken)]/60 hover:bg-[var(--color-surface-sunken)]/60">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={`text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider py-3 ${
                    col.headerClassName || col.className || ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
              {rowActions && (
                <TableHead className="text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider py-3 pr-4">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(pagination?.limit || 5, 5) }).map(
                (_, rowIdx) => (
                  <TableRow
                    key={`skeleton-${rowIdx}`}
                    className="border-b border-[var(--color-border)]"
                  >
                    {columns.map((_, colIdx) => (
                      <TableCell key={`col-${colIdx}`} className="py-3.5">
                        <Skeleton className="h-4 w-3/4" />
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell className="py-3.5 pr-4 text-right">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </TableCell>
                    )}
                  </TableRow>
                )
              )
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="py-12 text-center text-xs text-[var(--text-muted)]"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
                      <p className="font-medium">No records found</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Try adjusting search or filter parameters
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIdx) => {
                const key = item._id || item.id || `row-${rowIdx}`;
                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`border-b border-[var(--color-border)]/70 hover:bg-[var(--color-surface-sunken)]/50 transition-colors ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={`cell-${rowIdx}-${colIdx}`}
                        className={`py-3 text-xs text-[var(--text-primary)] ${
                          col.className || ""
                        }`}
                      >
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String(item[col.accessorKey] ?? "—")
                          : "—"}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell
                        className="py-3 pr-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(item)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-3.5 sm:px-4 border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {pagination.total === 0
                ? 0
                : (pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {pagination.total}
            </span>{" "}
            records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() =>
                pagination.onPageChange(Math.max(1, pagination.page - 1))
              }
              className="h-7 text-xs"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
            </Button>
            <span className="px-2 font-medium text-[var(--text-primary)] text-xs">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              onClick={() =>
                pagination.onPageChange(
                  Math.min(pagination.totalPages, pagination.page + 1)
                )
              }
              className="h-7 text-xs"
            >
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
