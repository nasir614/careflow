'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, History } from 'lucide-react';
import type { Attendance } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'staffName',
    header: 'Staff',
    cell: (row) => row.staffName,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (row) => row.date,
  },
  {
    accessorKey: 'checkInAM',
    header: 'Time In',
    cell: (row) => (
      <div>
        {row.checkInAM && <div>AM: {row.checkInAM}</div>}
        {row.checkInPM && <div>PM: {row.checkInPM}</div>}
      </div>
    ),
  },
  {
    accessorKey: 'checkOutAM',
    header: 'Time Out',
    cell: (row) => (
       <div>
        {row.checkOutAM && <div>AM: {row.checkOutAM}</div>}
        {row.checkOutPM && <div>PM: {row.checkOutPM}</div>}
      </div>
    ),
  },
  {
    accessorKey: 'totalHours',
    header: 'Total Hours',
    cell: (row) => row.totalHours.toFixed(2),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'present' ? 'badge-success' : row.status === 'excused' ? 'badge-warning' : 'badge-danger'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const historicalColumns: ColumnDef<Attendance>[] = [
  { accessorKey: 'clientName', header: 'Client', cell: (row) => row.clientName },
  { accessorKey: 'staffName', header: 'Staff', cell: (row) => row.staffName },
  { accessorKey: 'serviceType', header: 'Service Type', cell: (row) => row.serviceType },
  { accessorKey: 'date', header: 'Date', cell: (row) => row.date },
  {
    accessorKey: 'timeIn',
    header: 'Time In',
    cell: (row) => `${row.checkInAM || ''}${row.checkInAM && row.checkInPM ? ' | ' : ''}${row.checkInPM || ''}`,
  },
  {
    accessorKey: 'timeOut',
    header: 'Time Out',
    cell: (row) => `${row.checkOutAM || ''}${row.checkOutAM && row.checkOutPM ? ' | ' : ''}${row.checkOutPM || ''}`,
  },
  { accessorKey: 'totalHours', header: 'Total Hours', cell: (row) => row.totalHours.toFixed(2) },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: (row) => (
      <div className='text-xs'>
        <div>Status: <span className='font-medium'>{row.status}</span></div>
        {row.notes && <div>Notes: <span className='italic'>{row.notes}</span></div>}
      </div>
    ),
  },
];

const ITEMS_PER_PAGE = 8;

export default function AttendancePage() {
  const { attendance, clients, staff, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const staffOptions = useMemo(() => [...new Set(staff.map(s => s.name))], [staff]);

  const filteredData = useMemo(() => {
    return attendance.filter(item => {
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesClient = clientFilter === 'all' || item.clientName === clientFilter;
      const matchesStaff = staffFilter === 'all' || item.staffName === staffFilter;
      return matchesDate && matchesClient && matchesStaff;
    });
  }, [attendance, dateFilter, clientFilter, staffFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const sortedHistoricalData = useMemo(() => {
    return [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance]);

  const clearFilters = () => {
    setDateFilter('');
    setClientFilter('all');
    setStaffFilter('all');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumbs={[{ name: 'Attendance' }]} />

      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Input 
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <History className="w-6 h-6 text-primary" />
            Historical Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A detailed log of all attendance records since the beginning. This view is for archival and audit purposes.
          </p>
          <ScrollArea className="h-[400px] w-full">
            <DataTable
              columns={historicalColumns}
              data={sortedHistoricalData}
              onView={(row) => openModal('view', 'attendance', row)}
              onEdit={(row) => openModal('edit', 'attendance', row)}
              onDelete={(row) => openModal('delete', 'attendance', row)}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
