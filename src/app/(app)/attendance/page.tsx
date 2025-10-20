'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X, History, Search } from 'lucide-react';
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
const HISTORICAL_ITEMS_PER_PAGE = 10;

export default function AttendancePage() {
  const { attendance, clients, staff, openModal } = useCareFlow();
  
  // State for main table
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  // State for historical table
  const [historicalCurrentPage, setHistoricalCurrentPage] = useState(1);
  const [historicalSearchTerm, setHistoricalSearchTerm] = useState('');
  const [historicalClientFilter, setHistoricalClientFilter] = useState('all');
  const [historicalStaffFilter, setHistoricalStaffFilter] = useState('all');
  const [historicalServiceFilter, setHistoricalServiceFilter] = useState('all');
  const [historicalStartDate, setHistoricalStartDate] = useState('');
  const [historicalEndDate, setHistoricalEndDate] = useState('');


  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const staffOptions = useMemo(() => [...new Set(staff.map(s => s.name))], [staff]);
  const serviceTypeOptions = useMemo(() => [...new Set(attendance.map(a => a.serviceType))], [attendance]);

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
  
  const filteredHistoricalData = useMemo(() => {
    return [...attendance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(item => {
        const itemDate = new Date(item.date);
        const startDate = historicalStartDate ? new Date(historicalStartDate) : null;
        const endDate = historicalEndDate ? new Date(historicalEndDate) : null;
        if(startDate) startDate.setHours(0,0,0,0);
        if(endDate) endDate.setHours(23,59,59,999);
        
        const matchesSearch = !historicalSearchTerm ||
          item.clientName.toLowerCase().includes(historicalSearchTerm.toLowerCase()) ||
          item.staffName.toLowerCase().includes(historicalSearchTerm.toLowerCase()) ||
          item.serviceType.toLowerCase().includes(historicalSearchTerm.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(historicalSearchTerm.toLowerCase()));
        
        const matchesClient = historicalClientFilter === 'all' || item.clientName === historicalClientFilter;
        const matchesStaff = historicalStaffFilter === 'all' || item.staffName === historicalStaffFilter;
        const matchesService = historicalServiceFilter === 'all' || item.serviceType === historicalServiceFilter;
        const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
        
        return matchesSearch && matchesClient && matchesStaff && matchesService && matchesDateRange;
      });
  }, [attendance, historicalSearchTerm, historicalClientFilter, historicalStaffFilter, historicalServiceFilter, historicalStartDate, historicalEndDate]);

  const paginatedHistoricalData = useMemo(() => {
    const start = (historicalCurrentPage - 1) * HISTORICAL_ITEMS_PER_PAGE;
    return filteredHistoricalData.slice(start, start + HISTORICAL_ITEMS_PER_PAGE);
  }, [filteredHistoricalData, historicalCurrentPage]);

  const clearFilters = () => {
    setDateFilter('');
    setClientFilter('all');
    setStaffFilter('all');
  };

  const clearHistoricalFilters = () => {
    setHistoricalSearchTerm('');
    setHistoricalClientFilter('all');
    setHistoricalStaffFilter('all');
    setHistoricalServiceFilter('all');
    setHistoricalStartDate('');
    setHistoricalEndDate('');
    setHistoricalCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumbs={[{ name: 'Attendance' }]} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
            <Input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
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
      

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <History className="w-6 h-6 text-primary" />
            Historical Attendance
          </CardTitle>
           <p className="text-sm text-muted-foreground pt-2">
            A detailed log of all attendance records. Use the filters below to search and audit historical data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative md:col-span-2 lg:col-span-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search client, staff, service or notes..."
                    value={historicalSearchTerm}
                    onChange={e => setHistoricalSearchTerm(e.target.value)}
                    className="pl-10"
                  />
              </div>
              <Select value={historicalClientFilter} onValueChange={setHistoricalClientFilter}>
                <SelectTrigger><SelectValue placeholder="All Clients" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={historicalStaffFilter} onValueChange={setHistoricalStaffFilter}>
                <SelectTrigger><SelectValue placeholder="All Staff" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={historicalServiceFilter} onValueChange={setHistoricalServiceFilter}>
                <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input type="date" value={historicalStartDate} onChange={e => setHistoricalStartDate(e.target.value)} />
                <span className="text-muted-foreground hidden sm:block">-</span>
                <Input type="date" value={historicalEndDate} onChange={e => setHistoricalEndDate(e.target.value)} />
              </div>
              <div className="lg:col-start-4 flex justify-end">
                <Button variant="ghost" onClick={clearHistoricalFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="h-auto w-full">
            <DataTable
              columns={historicalColumns}
              data={paginatedHistoricalData}
              onView={(row) => openModal('view', 'attendance', row)}
            />
          </ScrollArea>
           <Pagination
              currentPage={historicalCurrentPage}
              totalItems={filteredHistoricalData.length}
              itemsPerPage={HISTORICAL_ITEMS_PER_PAGE}
              onPageChange={setHistoricalCurrentPage}
            />
        </CardContent>
      </Card>
    </div>
  );
}
