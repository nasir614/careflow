'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { EnrichedAttendance } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Filter, ListOrdered, PlusCircle, X } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const getStatusBadgeVariant = (status: EnrichedAttendance['status']) => {
  switch (status) {
    case 'present':
      return 'badge-success';
    case 'absent':
      return 'badge-danger';
    case 'excused':
      return 'badge-warning';
    default:
      return 'secondary';
  }
};

const getAdminStatusBadgeVariant = (status: EnrichedAttendance['adminStatus']) => {
  switch (status) {
    case 'Approved':
      return 'badge-success';
    case 'Rejected':
      return 'badge-danger';
    case 'Pending':
    default:
      return 'badge-warning';
  }
};

const columns: ColumnDef<EnrichedAttendance>[] = [
  {
    accessorKey: 'id',
    header: 'Attendance ID',
    cell: (row) => `ATT-${row.id}`,
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => (
      <div>
        <p className="font-medium">{row.clientName}</p>
        <p className="text-xs text-muted-foreground">{format(new Date(row.date + 'T00:00:00'), 'MM/dd/yyyy')}</p>
      </div>
    )
  },
  {
    accessorKey: 'staffName',
    header: 'Staff',
    cell: (row) => row.staffName,
  },
  {
    accessorKey: 'checkInAM',
    header: 'Time In/Out',
    cell: (row) => (
      <div className="text-xs">
        <p>AM: {row.checkInAM || '--:--'} / {row.checkOutAM || '--:--'}</p>
        <p>PM: {row.checkInPM || '--:--'} / {row.checkOutPM || '--:--'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'totalHours',
    header: 'Total Hours',
    cell: (row) => row.totalHours.toFixed(2),
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: (row) => (
      <div className="text-xs max-w-xs">
        <p><span className="font-semibold">Code:</span> {row.billingCode}</p>
        <p><span className="font-semibold">Procedures:</span> {row.procedures || 'N/A'}</p>
        <p className="italic truncate"><span className="font-semibold">Notes:</span> {row.notes || 'N/A'}</p>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <Badge className={cn('border-0', getStatusBadgeVariant(row.status))}>{row.status}</Badge>,
  },
  {
    accessorKey: 'adminStatus',
    header: 'Admin Status',
    cell: (row) => <Badge className={cn('border-0', getAdminStatusBadgeVariant(row.adminStatus))}>{row.adminStatus}</Badge>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function AttendancePage() {
  const { attendance, clients, staff, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    client: 'all',
    staff: 'all',
    status: 'all',
    dateRange: {
      from: subMonths(new Date(), 1),
      to: new Date(),
    } as DateRange | undefined,
  });

  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const staffOptions = useMemo(() => [...new Set(staff.map(s => s.name))], [staff]);
  const statusOptions: EnrichedAttendance['status'][] = ['present', 'absent', 'excused'];

  const filteredData = useMemo(() => {
    return attendance
      .filter(item => {
        const itemDate = new Date(item.date + 'T00:00:00');
        const matchesClient = filters.client === 'all' || item.clientName === filters.client;
        const matchesStaff = filters.staff === 'all' || item.staffName === filters.staff;
        const matchesStatus = filters.status === 'all' || item.status === filters.status;
        const matchesDate = filters.dateRange?.from && filters.dateRange?.to 
          ? itemDate >= filters.dateRange.from && itemDate <= filters.dateRange.to
          : true;
        return matchesClient && matchesStaff && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, filters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const clearFilters = () => {
    setFilters({
      client: 'all',
      staff: 'all',
      status: 'all',
      dateRange: {
        from: subMonths(new Date(), 1),
        to: new Date(),
      },
    });
  };
  
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumbs={[{ name: 'Attendance' }]}>
        <Button variant="outline" size="sm" onClick={() => openModal('add', 'attendance')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Single Entry
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                  <CardTitle className="flex items-center gap-2"><ListOrdered className="w-6 h-6 text-primary" /> Historical Attendance</CardTitle>
                  <CardDescription className="mt-1">View, edit, or delete past attendance records.</CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={() => openModal('add', 'attendance', { bulk: true })}>
                  <Clock className="w-4 h-4 mr-2" />
                  Bulk Add/Update
              </Button>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 pt-6">
             <Filter className="w-5 h-5 text-muted-foreground" />
             <Select value={filters.client} onValueChange={(v) => handleFilterChange('client', v)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.staff} onValueChange={(v) => handleFilterChange('staff', v)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[260px] h-9 justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => handleFilterChange('dateRange', range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" onClick={clearFilters} className="h-9">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'attendance', row)}
            onEdit={(row) => openModal('edit', 'attendance', row)}
            onDelete={(row) => openModal('delete', 'attendance', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
