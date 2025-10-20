'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Staff, Schedule, StaffCredential } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
    accessorKey: 'serviceCode',
    header: 'Code',
    cell: (row) => row.serviceCode,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: (row) => row.frequency,
  },
  {
    accessorKey: 'startDate',
    header: 'Period',
    cell: (row) => <div className="text-xs min-w-[80px]">{row.startDate} → {row.endDate}</div>,
  },
  {
    accessorKey: 'hoursPerDay',
    header: 'Hours',
    cell: (row) => row.hoursPerDay,
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

const getCredentialStatus = (expiryDate: string | null) => {
  if (!expiryDate) return { label: 'Active', className: 'bg-green-100 text-green-700' };
  const diff = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= 0) return { label: "Expired", className: "bg-red-100 text-red-700" };
  if (diff <= 30) return { label: "Expiring Soon", className: "bg-yellow-100 text-yellow-700" };
  return { label: 'Active', className: 'bg-green-100 text-green-700' };
};


const credentialColumns: ColumnDef<StaffCredential>[] = [
    {
      accessorKey: 'credential',
      header: 'Credential/Document',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.credential}</div>
          <div className="text-xs text-muted-foreground">{row.training || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'expirationDate',
      header: 'Expires On',
      cell: (row) => row.expirationDate || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getCredentialStatus(row.expirationDate);
        return <span className={cn('badge', status.className)}>{status.label}</span>;
      },
    },
    {
        accessorKey: 'isCritical',
        header: 'Critical',
        cell: (row) => row.isCritical ? <ShieldAlert className="w-5 h-5 text-destructive" /> : null,
    },
    {
      accessorKey: 'actionTaken',
      header: 'Notes',
      cell: (row) => row.actionTaken || '-',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: () => null,
    },
];

const ITEMS_PER_PAGE = 5;

export default function StaffPage() {
  const { staff, schedules, staffCredentials, openModal } = useCareFlow();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(staff[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const staffRoles = useMemo(() => [...new Set(staff.map(s => s.role))], [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, searchTerm, roleFilter, statusFilter]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaff, currentPage]);

  const staffSchedules = useMemo(() => {
    if (!selectedStaff) return [];
    return schedules.filter(s => s.staffId === selectedStaff.id);
  }, [schedules, selectedStaff]);

  const selectedStaffCredentials = useMemo(() => {
    if (!selectedStaff) return [];
    return staffCredentials.filter(c => c.staffId === selectedStaff.id);
  }, [staffCredentials, selectedStaff]);
  
  const credentialSummary = useMemo(() => {
    if (!selectedStaff) return { active: 0, expiring: 0, expired: 0 };
    return selectedStaffCredentials.reduce((acc, cred) => {
        const status = getCredentialStatus(cred.expirationDate).label;
        if(status === 'Active') acc.active++;
        if(status === 'Expiring Soon') acc.expiring++;
        if(status === 'Expired') acc.expired++;
        return acc;
    }, { active: 0, expiring: 0, expired: 0 });
  }, [selectedStaffCredentials, selectedStaff]);

  const getStaffAvatar = (staffId: number) => {
    const avatar = PlaceHolderImages.find(img => img.id === `staff-${staffId}`);
    return avatar?.imageUrl || '';
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Management" breadcrumbs={[{ name: 'Staff' }]}>
         <Button variant="outline" size="sm" onClick={() => openModal('add', 'staff')}>
          + Add New Staff
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle>Staff Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <Input 
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex gap-2">
                           <Select value={roleFilter} onValueChange={setRoleFilter}>
                             <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">All Roles</SelectItem>
                               {staffRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                             </SelectContent>
                           </Select>
                           <Select value={statusFilter} onValueChange={setStatusFilter}>
                             <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="all">All Statuses</SelectItem>
                               <SelectItem value="Active">Active</SelectItem>
                               <SelectItem value="Inactive">Inactive</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        {paginatedStaff.map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => setSelectedStaff(s)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                    selectedStaff?.id === s.id ? "bg-primary/10" : "hover:bg-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getStaffAvatar(s.id)} alt={s.name} />
                                    <AvatarFallback>{s.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-sm">{s.name}</div>
                                    <div className="text-xs text-muted-foreground">{s.role}</div>
                                </div>
                                <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                            </div>
                        ))}
                    </div>

                   {filteredStaff.length > ITEMS_PER_PAGE && (
                     <Pagination
                        currentPage={currentPage}
                        totalItems={filteredStaff.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                   )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedStaff ? (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <CalendarRange className="w-5 h-5 text-primary" />
                        Schedules for {selectedStaff.name}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openModal('add', 'schedules')}>
                        + Add Schedule
                    </Button>
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

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Credentials & Training for {selectedStaff.name}
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="text-green-700 border-green-200">{credentialSummary.active} Active</Badge>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-200">{credentialSummary.expiring} Expiring</Badge>
                        <Badge variant="outline" className="text-red-700 border-red-200">{credentialSummary.expired} Expired</Badge>
                     </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={credentialColumns}
                    data={selectedStaffCredentials}
                    onView={(row) => openModal('view', 'staffCredentials', row)}
                    onEdit={(row) => openModal('edit', 'staffCredentials', row)}
                    onDelete={(row) => openModal('delete', 'staffCredentials', row)}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
             <div className="flex items-center justify-center h-full bg-card rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Select a staff member to see their details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

    