'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format, subMonths, addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { Schedule, ServicePlan } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const dayAbbreviations: { [key: string]: string } = {
  monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'Th',
  friday: 'F', saturday: 'Sa', sunday: 'Su',
};

const columns = (servicePlans: ServicePlan[]): ColumnDef<Schedule>[] => [
  { accessorKey: 'expand', header: '', cell: () => null },
  { 
    accessorKey: 'id', 
    header: 'Schedule ID', 
    cell: ({ id }) => `SCH-${id}` 
  },
  { accessorKey: 'clientName', header: 'Client', cell: ({ clientName }) => clientName },
  { accessorKey: 'staffName', header: 'Staff', cell: ({ staffName }) => staffName },
  { accessorKey: 'serviceType', header: 'Service', cell: ({ serviceType }) => serviceType },
  {
    accessorKey: 'servicePlanId',
    header: 'Service Plan Period',
    cell: ({ servicePlanId }) => {
      const plan = servicePlans.find(p => p.id === servicePlanId);
      return <div className="text-xs min-w-[80px]">{plan ? `${plan.startDate} → ${plan.endDate}` : 'N/A'}</div>;
    }
  },
  { accessorKey: 'startDate', header: 'Schedule Period', cell: ({ startDate, endDate }) => <div className="text-xs min-w-[80px]">{startDate} → {endDate}</div> },
  {
    accessorKey: 'days',
    header: 'Days & Time',
    cell: ({ days, timeInAM, timeOutAM, timeInPM, timeOutPM }) => (
      <div>
        <div className="flex gap-1">
          {Object.keys(dayAbbreviations).map(day => (
            <div key={day} className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
              days.map(d => d.toLowerCase()).includes(day) ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'
            )} title={day.charAt(0).toUpperCase() + day.slice(1)}>
              {dayAbbreviations[day]}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {timeInAM}{timeOutAM && `-${timeOutAM}`}
          {timeInPM && `, ${timeInPM}-${timeOutPM}`}
        </div>
      </div>
    )
  },
  {
    accessorKey: 'usedUnits', header: 'Unit Usage', cell: ({ usedUnits, totalUnits }) => {
      const percentage = totalUnits > 0 ? (usedUnits / totalUnits) * 100 : 0;
      return (
        <div className="min-w-[120px]">
          <div className="text-sm font-medium text-foreground">{usedUnits} / {totalUnits} hrs</div>
          <Progress value={percentage} className="h-2 mt-1" />
        </div>
      )
    }
  },
  { accessorKey: 'status', header: 'Status', cell: ({ status }) => <Badge variant={status === 'active' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'} className={cn(status === 'active' && 'bg-green-500')}>{status}</Badge> },
  { accessorKey: 'actions', header: 'Actions', cell: () => null },
];

const ITEMS_PER_PAGE = 8;

export default function SchedulesPage() {
  const { schedules, servicePlans, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('active');

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: {
      from: subMonths(new Date(), 3),
      to: addDays(new Date(), 30),
    } as DateRange | undefined,
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      dateRange: { from: subMonths(new Date(), 3), to: addDays(new Date(), 30) },
    });
  };

  const filteredData = useMemo(() => {
    let data = schedules;

    if(activeTab === 'active') data = schedules.filter(s => s.status === 'active' || s.status === 'pending');
    if(activeTab === 'past') data = schedules.filter(s => s.status === 'expired');

    return data.filter(item => {
        const itemStartDate = new Date(item.startDate);
        const itemEndDate = new Date(item.endDate);
        const matchesSearch = filters.searchTerm === '' ||
          item.clientName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          item.staffName.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesStatus = filters.status === 'all' || item.status === filters.status;
        const matchesDate = filters.dateRange?.from && filters.dateRange?.to ? 
            (itemStartDate <= filters.dateRange.to && itemEndDate >= filters.dateRange.from)
            : true;
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [schedules, filters, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const ExpandableContent: React.FC<{ row: Schedule }> = ({ row }) => (
    <div className="bg-muted/50 p-4 text-sm space-y-2 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><b>Frequency:</b> {row.frequency}</div>
        <div><b>Service Code:</b> {row.serviceCode}</div>
        <div><b>AM Slot:</b> {row.timeInAM || 'N/A'} - {row.timeOutAM || 'N/A'}</div>
        <div><b>PM Slot:</b> {row.timeInPM || 'N/A'} - {row.timeOutPM || 'N/A'}</div>
      </div>
    </div>
  );
  
  const tableColumns = useMemo(() => columns(servicePlans), [servicePlans]);

  return (
    <div className="space-y-6">
      <PageHeader title="Schedules" breadcrumbs={[{ name: 'Schedules' }]} />
      
      <Card>
        <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
               <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 mb-4">
                 <Filter className="w-5 h-5 text-muted-foreground" />
                 <Input 
                   placeholder="Search client or staff..." 
                   className="w-full sm:w-auto sm:flex-1"
                   value={filters.searchTerm}
                   onChange={e => handleFilterChange('searchTerm', e.target.value)}
                 />
                 <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                    <SelectTrigger className="w-full sm:w-[160px] h-9">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                 </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button id="date" variant={"outline"} className={cn("w-full sm:w-[260px] h-9 justify-start text-left font-normal", !filters.dateRange && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                <>
                                    {format(filters.dateRange.from, "LLL dd, y")} - {format(filters.dateRange.to, "LLL dd, y")}
                                </>
                                ) : ( format(filters.dateRange.from, "LLL dd, y") )
                            ) : ( <span>Pick a date range</span> )}
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
              <TabsContent value={activeTab}>
                <DataTable
                  columns={tableColumns}
                  data={paginatedData}
                  onView={(row) => openModal('view', 'schedules', row)}
                  onEdit={(row) => openModal('edit', 'schedules', row)}
                  onDelete={(row) => openModal('delete', 'schedules', row)}
                  expandableRow={(row) => <ExpandableContent row={row} />}
                />
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredData.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
