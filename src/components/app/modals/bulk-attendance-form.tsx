'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Save, PlusCircle, X } from 'lucide-react';
import type { BulkAttendanceData, AttendanceStatus, Client } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { format, getDaysInMonth, setMonth, setYear, isValid, addDays } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DailyLog {
  date: string;
  status: AttendanceStatus;
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  notes: string;
  isHoliday: boolean;
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM'),
}));


export default function BulkAttendanceForm({ onSubmit, onCancel, isLoading }: {
  onSubmit: (data: BulkAttendanceData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { clients, staff } = useCareFlow();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [customDate, setCustomDate] = useState('');

  // Default values to apply to all rows
  const [defaultStatus, setDefaultStatus] = useState<AttendanceStatus>('present');
  const [defaultCheckInAM, setDefaultCheckInAM] = useState('09:00');
  const [defaultCheckOutPM, setDefaultCheckOutPM] = useState('15:00');


  useEffect(() => {
    if (selectedClient) {
      generateMonthDays();
    } else {
      setDailyLogs([]);
    }
  }, [selectedClient, selectedMonth, selectedYear]);

  const generateMonthDays = () => {
    const date = setYear(setMonth(new Date(), selectedMonth), selectedYear);
    const daysInMonth = getDaysInMonth(date);
    const logs: DailyLog[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(selectedYear, selectedMonth, i);
        logs.push({
            date: format(dayDate, 'yyyy-MM-dd'),
            status: defaultStatus,
            checkInAM: defaultCheckInAM,
            checkOutAM: '',
            checkInPM: '',
            checkOutPM: defaultCheckOutPM,
            notes: '',
            isHoliday: false,
        });
    }
    setDailyLogs(logs);
  };

  const addCustomDate = () => {
    if (customDate && !dailyLogs.some(log => log.date === customDate)) {
      const newLog: DailyLog = {
        date: customDate,
        status: defaultStatus,
        checkInAM: defaultCheckInAM,
        checkOutAM: '',
        checkInPM: '',
        checkOutPM: defaultCheckOutPM,
        notes: '',
        isHoliday: false,
      };
      
      const newLogs = [...dailyLogs, newLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailyLogs(newLogs);
      setCustomDate('');
    }
  };

  const handleDailyLogChange = (index: number, field: keyof DailyLog, value: string | boolean) => {
    const newLogs = [...dailyLogs];
    const logToUpdate = { ...newLogs[index], [field]: value };
    newLogs[index] = logToUpdate;
    setDailyLogs(newLogs);
  };
  
  const removeDateEntry = (index: number) => {
    const newLogs = [...dailyLogs];
    newLogs.splice(index, 1);
    setDailyLogs(newLogs);
  };

  const applyDefaults = () => {
    setDailyLogs(logs => logs.map(log => ({
      ...log,
      status: defaultStatus,
      checkInAM: log.status === 'present' ? defaultCheckInAM : '',
      checkOutAM: '',
      checkInPM: '',
      checkOutPM: log.status === 'present' ? defaultCheckOutPM : '',
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedStaffId) {
      console.error("Client and Staff must be selected");
      return;
    }

    const logsToSubmit = dailyLogs.filter(log => log.date && log.status);
    
    const data: BulkAttendanceData = {
      clientIds: [selectedClient.id],
      staffId: parseInt(selectedStaffId, 10),
      serviceType: 'Adult Day Care',
      location: 'Daycare Center',
      billingCode: 'T2021',
      dailyLogs: logsToSubmit.map(log => ({
        date: log.date,
        status: log.status,
        checkInAM: log.checkInAM,
        checkOutAM: log.checkOutAM,
        checkInPM: log.checkInPM,
        checkOutPM: log.checkOutPM,
        notes: log.notes,
      })),
      startDate: '', // Not used in this logic
      endDate: '', // Not used in this logic
    };
    
    onSubmit(data);
  };

  const attendanceStatusOptions: {value: AttendanceStatus, label: string}[] = [
    { value: 'present', label: 'Present' },
    { value: 'excused', label: 'Excused' },
    { value: 'absent', label: 'Absent' },
    { value: 'absent_hospital', label: 'Hospital' },
    { value: 'absent_travel', label: 'Travel' },
    { value: 'absent_personal', label: 'Personal' },
  ];
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
          {/* Top selection fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg bg-muted/50">
             <div>
                <Label>Client</Label>
                <Select onValueChange={(val) => setSelectedClient(clients.find(c => String(c.id) === val) || null)}>
                    <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div>
                <Label>Assigned Staff</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                    <SelectContent>
                    {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
          </div>

          {selectedClient && (
            <>
              {/* Month/Year and Default settings bar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end p-3 border rounded-lg">
                <div className="flex gap-2">
                    <div>
                        <Label className="text-xs">Month</Label>
                        <Select value={String(selectedMonth)} onValueChange={val => setSelectedMonth(parseInt(val))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Year</Label>
                        <Select value={String(selectedYear)} onValueChange={val => setSelectedYear(parseInt(val))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Default Status</Label>
                    <Select value={defaultStatus} onValueChange={val => setDefaultStatus(val as AttendanceStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{attendanceStatusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Default In</Label>
                    <Input type="time" value={defaultCheckInAM} onChange={e => setDefaultCheckInAM(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Default Out</Label>
                    <Input type="time" value={defaultCheckOutPM} onChange={e => setDefaultCheckOutPM(e.target.value)} />
                  </div>
                </div>
                <Button type="button" onClick={applyDefaults} className="w-full lg:col-span-2">Apply Defaults to All</Button>
              </div>

              {/* Timesheet Grid */}
              <ScrollArea className="h-[40vh] w-full border rounded-lg">
                <div className="p-4 space-y-3">
                  {dailyLogs.length > 0 ? dailyLogs.map((log, index) => {
                    const dayName = format(new Date(log.date + 'T12:00:00'), 'EEE'); // Use noon to avoid timezone shifts
                    return (
                      <div key={index} className="grid grid-cols-12 gap-x-3 gap-y-2 items-center pb-3 border-b last:border-b-0">
                          <div className="col-span-12 sm:col-span-2 font-medium flex items-center gap-2">
                            <span className="w-8 text-sm text-muted-foreground">{dayName}</span>
                            <Input type="date" value={log.date} onChange={e => handleDailyLogChange(index, 'date', e.target.value)} className="w-full" />
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                             <Select value={log.status} onValueChange={(val) => handleDailyLogChange(index, 'status', val)}>
                                <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                                <SelectContent>{attendanceStatusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            <Input type="time" value={log.checkInAM} onChange={e => handleDailyLogChange(index, 'checkInAM', e.target.value)} disabled={log.status !== 'present'} />
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                            <Input type="time" value={log.checkOutPM} onChange={e => handleDailyLogChange(index, 'checkOutPM', e.target.value)} disabled={log.status !== 'present'} />
                          </div>
                          <div className="col-span-12 sm:col-span-3">
                            <Input placeholder="Notes..." value={log.notes} onChange={e => handleDailyLogChange(index, 'notes', e.target.value)} />
                          </div>
                          <div className="col-span-12 sm:col-span-1 flex items-center justify-end">
                               <Button type="button" variant="ghost" size="icon" onClick={() => removeDateEntry(index)}>
                                  <X className="w-4 h-4 text-destructive" />
                               </Button>
                          </div>
                      </div>
                    )
                  }) : (
                     <div className="text-center py-10 text-muted-foreground">
                        <p>No dates generated for this month.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
               <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/20">
                    <Input 
                        type="date" 
                        value={customDate} 
                        onChange={e => setCustomDate(e.target.value)} 
                        className="w-full"
                    />
                    <Button type="button" variant="outline" onClick={addCustomDate} disabled={!customDate}>
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Date
                    </Button>
                </div>
            </>
          )}

      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !selectedClient || dailyLogs.length === 0}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Generate Logs
        </Button>
      </div>
    </form>
  );
}
