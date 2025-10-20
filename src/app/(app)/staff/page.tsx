'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import type { Staff, Schedule, StaffCredential } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange, ShieldCheck, Phone, Mail, Briefcase, Contact } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const scheduleColumns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'id',
    header: 'Schedule ID',
    cell: (row) => `SCH-${row.id}`,
  },
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
    cell: (row) => <div className="text-xs min-w-[150px]">{row.startDate} → {row.endDate}</div>,
  },
  {
    accessorKey: 'hoursPerDay',
    header: 'Hours',
    cell: (row) => row.hoursPerDay,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <Badge variant={row.status === 'active' ? 'default' : row.status === 'expired' ? 'destructive' : 'secondary'} className={cn(row.status === 'active' ? 'bg-green-100 text-green-700' : row.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700', 'border-0')}>{row.status}</Badge>,
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
      accessorKey: 'id',
      header: 'Credential ID',
      cell: (row) => `CRED-${row.id}`,
    },
    {
      accessorKey: 'credential',
      header: 'Credential/Document',
      cell: (row) => (
        <div className="min-w-[150px]">
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
        return <Badge className={cn(status.className, 'border-0')}>{status.label}</Badge>;
      },
    },
    {
        accessorKey: 'isCritical',
        header: 'Critical',
        cell: (row) => row.isCritical ? 'Yes' : 'No',
    },
    {
      accessorKey: 'actionTaken',
      header: 'Notes',
      cell: (row) => <span className="text-xs italic">{row.actionTaken || '-'}</span>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: () => null,
    },
];

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon: React.ElementType; }> = ({ label, value, icon: Icon }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase flex items-center gap-1.5"><Icon className="w-3 h-3" /> {label}</p>
        <div className="text-sm font-medium mt-0.5">
            {value}
        </div>
    </div>
);

export default function StaffPage() {
  const { staff, schedules, staffCredentials, openModal } = useCareFlow();
  
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

      <Card>
        <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <div className='space-y-2 pt-4'>
                <Input 
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-2">
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
        </CardHeader>
        <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 pb-4">
                    {filteredStaff.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => setSelectedStaff(s)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors w-32 shrink-0 border-2",
                                selectedStaff?.id === s.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={getStaffAvatar(s.id)} alt={s.name} />
                                <AvatarFallback>{s.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className='text-center'>
                                <Badge variant="secondary" className="mb-1">ID: {s.id}</Badge>
                                <div className="font-medium text-sm truncate w-full">{s.name}</div>
                                <div className="text-xs text-muted-foreground truncate w-full">{s.role}</div>
                            </div>
                        </div>
                    ))}
                    {filteredStaff.length === 0 && (
                      <div className="w-full text-center py-4">No staff members found.</div>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </CardContent>
      </Card>

      {selectedStaff ? (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 shrink-0">
                        <AvatarImage src={getStaffAvatar(selectedStaff.id)} alt={selectedStaff.name} />
                        <AvatarFallback className="text-2xl">{selectedStaff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-xl font-bold">{selectedStaff.name}</CardTitle>
                        <p className="text-muted-foreground">{selectedStaff.role}</p>
                    </div>
                      <Badge variant={selectedStaff.status === 'Active' ? 'default' : 'destructive'} className={cn(selectedStaff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', 'border-0 mt-2 sm:mt-0')}>{selectedStaff.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoItem label="Email" value={selectedStaff.email} icon={Mail} />
                    <InfoItem label="Phone" value={selectedStaff.phone} icon={Phone} />
                    <InfoItem label="Department" value={selectedStaff.department} icon={Briefcase} />
                    <InfoItem label="Emergency Contact" value={`${selectedStaff.emergencyContactName} (${selectedStaff.emergencyContactPhone})`} icon={Contact} />
                </div>
            </CardContent>
        </Card>
      ) : (
          <div className="flex items-center justify-center h-48 bg-card rounded-2xl border border-dashed">
            <p className="text-muted-foreground">Select a staff member to see their details.</p>
        </div>
      )}

      {selectedStaff && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between text-lg gap-2">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between text-lg gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Credentials & Training for {selectedStaff.name}
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
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
        </div>
      )}
    </div>
  );
}
