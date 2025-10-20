'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save, CalendarDays, PlusCircle, X } from 'lucide-react';
import type { BulkAttendanceData, AttendanceStatus, Client } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { format, startOfMonth, isValid, addDays } from 'date-fns';
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

export default function BulkAttendanceForm({ onSubmit, isLoading, onCancel }: {
  onSubmit: (data: BulkAttendanceData) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const { clients, staff } = useCareFlow();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('Adult Day Care');
  
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  // Default values to apply to all rows
  const [defaultStatus, setDefaultStatus] = useState<AttendanceStatus>('present');
  const [defaultCheckInAM, setDefaultCheckInAM] = useState('09:00');
  const [defaultCheckOutPM, setDefaultCheckOutPM] = useState('15:00');


  useEffect(() => {
    // When client changes, reset the logs
    setDailyLogs([]);
  }, [selectedClient]);

  const addDateEntry = (dateStr: string, insertAfterIndex?: number) => {
    if (dateStr && !dailyLogs.some(log => log.date === dateStr)) {
      const newLog: DailyLog = {
        date: dateStr,
        status: defaultStatus,
        checkInAM: defaultCheckInAM,
        checkOutAM: '',
        checkInPM: '',
        checkOutPM: defaultCheckOutPM,
        notes: '',
        isHoliday: false,
      };

      let newLogs = [...dailyLogs];
      if (insertAfterIndex !== undefined) {
          newLogs.splice(insertAfterIndex + 1, 0, newLog);
      } else {
          newLogs.push(newLog);
      }
      
      newLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailyLogs(newLogs);
    }
  };
  
  useEffect(() => {
    if (dailyLogs.length === 0) {
      addDateEntry(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [dailyLogs]);

  const handleDailyLogChange = (index: number, field: keyof DailyLog, value: string | boolean) => {
    const newLogs = [...dailyLogs];
    (newLogs[index] as any)[field] = value;
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
      checkInAM: defaultCheckInAM,
      checkOutAM: '',
      checkInPM: '',
      checkOutPM: defaultCheckOutPM,
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedStaffId) {
      console.error("Client and Staff must be selected");
      return;
    }

    const logsToSubmit = dailyLogs.filter(log => log.status !== 'absent' && log.date);
    
    const data: BulkAttendanceData = {
      clientIds: [selectedClient.id],
      staffId: parseInt(selectedStaffId, 10),
      serviceType: selectedServiceType,
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-muted/50">
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
                  {dailyLogs.length > 0 ? dailyLogs.map((log, index) => {
                    const day = new Date(log.date + 'T12:00:00'); // Use noon to avoid timezone shifts
                    return (
                      <div key={index} className="grid grid-cols-12 gap-x-3 gap-y-2 items-center pb-3 border-b last:border-b-0">
                          <div className="col-span-12 sm:col-span-2 font-medium flex items-center gap-2">
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
                          <div className="col-span-12 sm:col-span-1 flex items-center justify-end gap-1">
                               <Button type="button" variant="ghost" size="icon" onClick={() => addDateEntry(format(addDays(day, 1), 'yyyy-MM-dd'), index)}>
                                  <PlusCircle className="w-4 h-4" />
                               </Button>
                               <Button type="button" variant="ghost" size="icon" onClick={() => removeDateEntry(index)} disabled={dailyLogs.length <= 1}>
                                  <X className="w-4 h-4 text-destructive" />
                               </Button>
                          </div>
                      </div>
                    )
                  }) : (
                     <div className="text-center py-10 text-muted-foreground">
                        <p>No dates added yet.</p>
                        <p className="text-sm">Click the plus button to add a service date.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
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
