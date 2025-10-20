'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Staff, Schedule } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

const staffColumns: ColumnDef<Staff>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={row.avatarUrl} alt={row.name} />
          <AvatarFallback>{row.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.role}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Contact',
    cell: (row) => row.phone,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: (row) => row.department,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span>,
  },
];

const scheduleColumns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'serviceType',
    header: 'Service',
    cell: (row) => row.serviceType,
  },
  {
    accessorKey: 'startDate',
    header: 'Period',
    cell: (row) => <div className="text-xs min-w-[80px]">{row.startDate}<br />to {row.endDate}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : row.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 5;

export default function StaffPage() {
  const { staff, schedules, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(staff[0] || null);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return staff.slice(start, start + ITEMS_PER_PAGE);
  }, [staff, currentPage]);

  const staffSchedules = useMemo(() => {
    if (!selectedStaff) return [];
    return schedules.filter(s => s.staffId === selectedStaff.id);
  }, [schedules, selectedStaff]);

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" breadcrumbs={[{ name: 'Staff' }]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Staff</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {paginatedStaff.map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => setSelectedStaff(s)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                    selectedStaff?.id === s.id ? "bg-primary/10" : "hover:bg-muted"
                                )}
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={s.avatarUrl} alt={s.name} />
                                    <AvatarFallback>{s.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-sm">{s.name}</div>
                                    <div className="text-xs text-muted-foreground">{s.role}</div>
                                </div>
                                <span className={`ml-auto text-xs badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={staff.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedStaff ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-primary" />
                  Schedules for {selectedStaff.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={scheduleColumns}
                  data={staffSchedules}
                  onView={(row) => openModal('view', 'schedules', row)}
                  onEdit={(row) => openModal('edit', 'schedules', row)}
                  onDelete={(row) => openModal('delete', 'schedules', row)}
                />
              </CardContent>
            </Card>
          ) : (
             <div className="flex items-center justify-center h-full bg-card rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Select a staff member to see their schedules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
