'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X, Trash2 } from 'lucide-react';
import type { Attendance } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { format, getDaysInMonth, isValid, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BulkAttendanceFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
}

type DailyLog = {
  date: string;
  status: Attendance['status'];
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  notes: string;
};

export default function BulkAttendanceForm({ onSubmit, isLoading, onCancel }: BulkAttendanceFormProps) {
  const { clients, staff, attendance } = useCareFlow();
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBillingCode, setSelectedBillingCode] = useState<string>('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [userModifiedDates, setUserModifiedDates] = useState<Set<string>>(new Set());

  const [defaults, setDefaults] = useState({
    status: 'present' as Attendance['status'],
    checkInAM: '09:00',
    checkOutAM: '12:00',
    checkInPM: '13:00',
    checkOutPM: '16:00',
  });

  useEffect(() => {
    if (!selectedClientId) {
      setDailyLogs([]);
      return;
    }

    const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
    const newLogs: DailyLog[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const existingLog = attendance.find(a => 
        String(a.clientId) === selectedClientId && 
        format(new Date(a.date + 'T00:00:00'), 'yyyy-MM-dd') === dateString
      );

      if (existingLog) {
        newLogs.push({
          date: dateString,
          status: existingLog.status,
          checkInAM: existingLog.checkInAM || '',
          checkOutAM: existingLog.checkOutAM || '',
          checkInPM: existingLog.checkInPM || '',
          checkOutPM: existingLog.checkOutPM || '',
          notes: existingLog.notes || '',
        });
      } else {
        newLogs.push({
          date: dateString,
          status: 'present',
          checkInAM: '',
          checkOutAM: '',
          checkInPM: '',
          checkOutPM: '',
          notes: '',
        });
      }
    }
    
    const prevLogsMap = new Map(dailyLogs.map(l => [l.date, l]));
    const mergedLogs = newLogs.map(log => {
      if(prevLogsMap.has(log.date) && userModifiedDates.has(log.date)) {
        return prevLogsMap.get(log.date)!;
      }
      return log;
    });

    setDailyLogs(mergedLogs);

  }, [selectedClientId, currentMonth, currentYear, attendance]);


  const handleDailyLogChange = (index: number, field: keyof DailyLog, value: string) => {
    const newLogs = [...dailyLogs];
    const logDate = newLogs[index].date;
    
    newLogs[index] = { ...newLogs[index], [field]: value };
    setDailyLogs(newLogs);
    
    const modifiedDateKey = field === 'date' ? value : logDate;
    setUserModifiedDates(prev => new Set(prev).add(modifiedDateKey));
  };

  const addCustomDate = (date: Date | undefined) => {
    if (!date) return;
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const dateString = format(adjustedDate, 'yyyy-MM-dd');
    if (dailyLogs.some(log => log.date === dateString)) return;

    const newLogs = [...dailyLogs, {
        date: dateString,
        status: 'present',
        checkInAM: '', checkOutAM: '', checkInPM: '', checkOutPM: '', notes: '',
    }];
    newLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDailyLogs(newLogs);
  };
  
  const removeLog = (index: number) => {
    setDailyLogs(prev => prev.filter((_, i) => i !== index));
  };

  const applyDefaults = () => {
    setDailyLogs(logs => logs.map(log => ({
      ...log,
      ...defaults
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => String(c.id) === selectedClientId);
    const staffMember = staff.find(s => String(s.id) === selectedStaffId);

    if (!client || !staffMember || !selectedService || !selectedBillingCode) {
        alert('Please select client, staff, service, and billing code.');
        return;
    }

    const logsToSubmit = dailyLogs.filter(log => (log.checkInAM && log.checkOutAM) || log.status !== 'present');

    onSubmit({
      client,
      staff: staffMember,
      serviceType: selectedService,
      billingCode: selectedBillingCode,
      logs: logsToSubmit,
    });
  };
  
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i, label: format(new Date(0, i), 'MMMM') }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <form onSubmit={handleSubmit}>
        <div className="space-y-4 p-1">
            <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                            <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                            <SelectContent>
                            {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStaffId} onValueChange={setSelectedStaffId} required>
                            <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                            <SelectContent>
                            {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedService} onValueChange={setSelectedService} required>
                            <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                            <SelectContent>
                                {['Adult Day Care', 'Personal Care', 'Day Support', 'Respite Care'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedBillingCode} onValueChange={setSelectedBillingCode} required>
                            <SelectTrigger><SelectValue placeholder="Billing Code" /></SelectTrigger>
                            <SelectContent>
                                {['T2021', 'T1019', 'S5150', 'T1005'].map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select value={String(currentMonth)} onValueChange={(v) => setCurrentMonth(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                            <SelectContent>
                            {monthOptions.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={String(currentYear)} onValueChange={(v) => setCurrentYear(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                            <SelectContent>
                            {yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>

             {selectedClientId && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Apply Defaults to All</CardTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end pt-2">
                        <Select value={defaults.status} onValueChange={v => setDefaults(p => ({...p, status: v as Attendance['status']}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="time" value={defaults.checkInAM} onChange={e => setDefaults(p => ({...p, checkInAM: e.target.value}))}/>
                        <Input type="time" value={defaults.checkOutAM} onChange={e => setDefaults(p => ({...p, checkOutAM: e.target.value}))}/>
                        <Input type="time" value={defaults.checkInPM} onChange={e => setDefaults(p => ({...p, checkInPM: e.target.value}))}/>
                        <Button type="button" onClick={applyDefaults} className="w-full">Apply</Button>
                    </div>
                </CardHeader>
                <CardContent className="max-h-[40vh] overflow-y-auto pr-3">
                <div className="p-4 space-y-3">
                  {dailyLogs.length > 0 ? dailyLogs.map((log, index) => {
                     const dayName = log.date && isValid(parse(log.date, 'yyyy-MM-dd', new Date())) 
                        ? format(parse(log.date, 'yyyy-MM-dd', new Date()), 'EEE') 
                        : '...';
                    return (
                      <div key={index} className="grid grid-cols-12 gap-x-3 gap-y-2 items-center pb-3 border-b last:border-b-0">
                          <div className="col-span-12 sm:col-span-2 font-medium flex items-center gap-2">
                              <Input type="date" value={log.date} onChange={e => handleDailyLogChange(index, 'date', e.target.value)} className="w-full"/>
                              <span className="text-muted-foreground text-sm">{dayName}</span>
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                              <Select value={log.status} onValueChange={(v) => handleDailyLogChange(index, 'status', v as Attendance['status'])}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="excused">Excused</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                              <Input type="time" value={log.checkInAM} onChange={e => handleDailyLogChange(index, 'checkInAM', e.target.value)} disabled={log.status !== 'present'}/>
                          </div>
                          <div className="col-span-6 sm:col-span-2">
                              <Input type="time" value={log.checkOutAM} onChange={e => handleDailyLogChange(index, 'checkOutAM', e.target.value)} disabled={log.status !== 'present'}/>
                          </div>
                           <div className="col-span-6 sm:col-span-2">
                              <Input type="time" value={log.checkInPM} onChange={e => handleDailyLogChange(index, 'checkInPM', e.target.value)} disabled={log.status !== 'present'}/>
                          </div>
                           <div className="col-span-12 sm:col-span-2">
                              <Input type="time" value={log.checkOutPM} onChange={e => handleDailyLogChange(index, 'checkOutPM', e.target.value)} disabled={log.status !== 'present'}/>
                          </div>
                          <div className="col-span-10">
                             <Input placeholder="Notes..." value={log.notes} onChange={e => handleDailyLogChange(index, 'notes', e.target.value)} />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLog(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                      </div>
                    );
                  }) : <p className="text-muted-foreground text-center py-4">Please select a client to see attendance logs.</p>}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Input type="date" className="w-48" onChange={(e) => addCustomDate(e.target.valueAsDate ?? undefined)} />
                  </div>
                </CardContent>
            </Card>
            )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !selectedClientId || !selectedStaffId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Generate Logs
            </Button>
        </div>
    </form>
  );
}
