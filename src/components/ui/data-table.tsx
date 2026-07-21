"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<TData> {
  header: string;
  accessorKey?: keyof TData;
  cell?: (row: TData, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  meta: DataTableMeta;
  loading?: boolean;
  searchPlaceholder?: string;
  initialSearch?: string;
  onPageChange: (page: number) => void;
  onSearch?: (search: string) => void;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  meta,
  loading = false,
  searchPlaceholder = "Cari data...",
  initialSearch = "",
  onPageChange,
  onSearch,
  actions,
  tabs,
  emptyMessage = "Belum ada data tersedia.",
  emptyIcon = <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-4" />,
}: DataTableProps<TData>) {
  const [searchValue, setSearchValue] = React.useState(initialSearch);

  // Handle debounced search
  React.useEffect(() => {
    if (!onSearch) return;
    
    // Only debounce if value changed from initial to avoid immediate fetch on mount
    const handler = setTimeout(() => {
      onSearch(searchValue);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchValue, onSearch]);

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto flex-1">
          {tabs && <div>{tabs}</div>}
          
          {onSearch && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-9 bg-white"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          )}
        </div>
        
        {actions && (
          <div className="shrink-0 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={`whitespace-nowrap font-bold text-slate-700 ${col.className || ""}`}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: meta.limit || 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        <Skeleton className="h-5 w-full max-w-[200px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      {emptyIcon}
                      <p className="font-medium text-slate-600">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        {col.cell
                          ? col.cell(row, rowIndex)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "-")
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500 hidden sm:block">
            Menampilkan <span className="font-bold text-slate-700">{data.length}</span> dari <span className="font-bold text-slate-700">{meta.total}</span> data
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: meta.totalPages }).map((_, i) => {
                const p = i + 1;
                // Simple pagination window logic
                if (
                  p === 1 || 
                  p === meta.totalPages || 
                  (p >= meta.page - 1 && p <= meta.page + 1)
                ) {
                  return (
                    <Button
                      key={p}
                      variant={p === meta.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 p-0 ${p === meta.page ? "bg-primary text-primary-foreground shadow-sm" : "bg-white"}`}
                    >
                      {p}
                    </Button>
                  );
                } else if (p === meta.page - 2 || p === meta.page + 2) {
                  return <span key={p} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="h-8"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
