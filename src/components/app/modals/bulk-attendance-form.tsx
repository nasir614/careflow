'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save, CalendarDays } from 'lucide-react';
import type { BulkAttendanceData, AttendanceStatus, Client } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { getDaysInMonth, format, startOfMonth } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DailyLog {
  date: string;
  status: AttendanceStatus;
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  notes: string;
  isHoliday: boolean; // You might want to pass this in based on a holiday calendar
}

export default function BulkAttendanceForm({ onSubmit, isLoading, onCancel }: BulkAttendanceFormProps) {
  const { clients, staff } = useCareFlow();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('Adult Day Care');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Default values to apply to all rows
  const [defaultStatus, setDefaultStatus] = useState<AttendanceStatus>('present');
  const [defaultCheckInAM, setDefaultCheckInAM] = useState('09:00');
  const [defaultCheckOutPM, setDefaultCheckOutPM] = useState('15:00');


  useEffect(() => {
    if (selectedMonth && selectedClient) {
      const monthDate = new Date(selectedMonth + '-02'); // Use day 2 to avoid timezone issues
      const daysInMonth = getDaysInMonth(monthDate);
      const monthStart = startOfMonth(monthDate);
      
      const logs: DailyLog[] = Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(monthStart);
        day.setDate(i + 1);
        const dayOfWeek = day.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        return {
          date: format(day, 'yyyy-MM-dd'),
          status: isWeekend ? 'absent' : 'present',
          checkInAM: isWeekend ? '' : '09:00',
          checkOutAM: '',
          checkInPM: '',
          checkOutPM: isWeekend ? '' : '15:00',
          notes: '',
          isHoliday: false,
        };
      });
      setDailyLogs(logs);
    } else {
      setDailyLogs([]);
    }
  }, [selectedMonth, selectedClient]);


  const handleDailyLogChange = (index: number, field: keyof DailyLog, value: string) => {
    const newLogs = [...dailyLogs];
    (newLogs[index] as any)[field] = value;
    setDailyLogs(newLogs);
  };
  
  const applyDefaults = () => {
    setDailyLogs(logs => logs.map(log => {
      const dayOfWeek = new Date(log.date).getDay();
      if(dayOfWeek !== 0 && dayOfWeek !== 6) { // Not a weekend
        return {
          ...log,
          status: defaultStatus,
          checkInAM: defaultCheckInAM,
          checkOutAM: '',
          checkInPM: '',
          checkOutPM: defaultCheckOutPM,
        }
      }
      return log;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedStaffId) {
      // You might want to show a toast message here
      console.error("Client, Staff and Service must be selected");
      return;
    }

    // Filter to only submit logs that are not 'absent' to avoid creating unnecessary records
    const logsToSubmit = dailyLogs.filter(log => log.status !== 'absent');
    
    // Transform dailyLogs into the format expected by handleBulkAddAttendance
    const data: BulkAttendanceData = {
      clientIds: [selectedClient.id],
      staffId: parseInt(selectedStaffId, 10),
      serviceType: selectedServiceType,
      location: 'Daycare Center', // Or make this configurable
      billingCode: 'T2021', // Or make this configurable
      // These fields are now handled per-day, so we pass the array of logs
      dailyLogs: logsToSubmit.map(log => ({
        date: log.date,
        status: log.status,
        checkInAM: log.checkInAM,
        checkOutAM: log.checkOutAM,
        checkInPM: log.checkInPM,
        checkOutPM: log.checkOutPM,
        notes: log.notes,
      })),
      // startDate and endDate are not needed for this new submission format
      startDate: '',
      endDate: '',
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-muted/50">
             <div className="md:col-span-2">
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
             <div>
                <Label>Month</Label>
                <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
             </div>
          </div>

          {selectedClient && (
            <>
              {/* Default settings bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-3 border rounded-lg">
                <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-2">
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
                <Button type="button" onClick={applyDefaults} className="w-full">Apply to All</Button>
              </div>

              {/* Timesheet Grid */}
              <ScrollArea className="h-[40vh] w-full border rounded-lg">
                <div className="p-4 space-y-3">
                  {dailyLogs.map((log, index) => {
                    const day = new Date(log.date + 'T12:00:00'); // Use noon to avoid timezone shifts
                    return (
                      <div key={log.date} className="grid grid-cols-12 gap-x-3 gap-y-2 items-center pb-3 border-b last:border-b-0">
                          <div className="col-span-12 sm:col-span-2 font-medium flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <div>
                               <div>{format(day, 'EEE, dd')}</div>
                               <div className="text-xs text-muted-foreground">{format(day, 'MMMM yyyy')}</div>
                            </div>
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
                          <div className="col-span-6 sm:col-span-4">
                            <Input placeholder="Notes..." value={log.notes} onChange={e => handleDailyLogChange(index, 'notes', e.target.value)} />
                          </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          )}

      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !selectedClient}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Generate Logs
        </Button>
      </div>
    </form>
  );
}

// Add a placeholder for props, if it's not defined anywhere else.
// This is to satisfy TypeScript if the component is used elsewhere without this interface.
interface BulkAttendanceFormProps {
  onSubmit: (data: BulkAttendanceData) => void;
  isLoading: boolean;
  onCancel: () => void;
}
