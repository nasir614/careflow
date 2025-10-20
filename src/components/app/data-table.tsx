'use client'

import { useState, Fragment } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  accessorKey: keyof T | 'actions' | 'expand';
  header: string;
  cell: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  expandableRow?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: any }>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  expandableRow,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());

  const toggleRow = (id: any) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.accessorKey)} className="font-semibold">{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <Fragment key={row.id}>
                <TableRow className={cn(expandedRows.has(row.id) && 'border-b-0')}>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.accessorKey === 'actions' ? (
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && <DropdownMenuItem onClick={() => onView(row)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>}
                            {onEdit && <DropdownMenuItem onClick={() => onEdit(row)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>}
                            {onDelete && <DropdownMenuItem onClick={() => onDelete(row)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : column.accessorKey === 'expand' ? (
                        <Button variant="ghost" size="icon" onClick={() => toggleRow(row.id)} disabled={!expandableRow}>
                          {expandedRows.has(row.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      ) : (
                        column.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {expandableRow && expandedRows.has(row.id) && (
                  <TableRow key={`${row.id}-expand`}>
                    <TableCell colSpan={columns.length}>
                        {expandableRow(row)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
       <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
