'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import type { Schedule } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';

interface ScheduleFormProps {
  item: Schedule | null;
  onSubmit: (data: Partial<Schedule>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ScheduleForm({ item, onSubmit, isLoading, onCancel }: ScheduleFormProps) {
  const { clients, staff, servicePlans } = useCareFlow();
  const [formData, setFormData] = useState<Partial<Schedule>>({});

  const clientServicePlans = useMemo(() => {
    if (!formData.clientId) return [];
    return servicePlans.filter(p => String(p.clientId) === String(formData.clientId));
  }, [formData.clientId, servicePlans]);

  const selectedServicePlan = useMemo(() => {
    if (!formData.servicePlanId) return null;
    return clientServicePlans.find(p => String(p.id) === String(formData.servicePlanId));
  }, [formData.servicePlanId, clientServicePlans]);


  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        clientId: String(item.clientId),
        staffId: String(item.staffId),
        servicePlanId: item.servicePlanId ? String(item.servicePlanId) : undefined,
        days: Array.isArray(item.days) ? item.days.join(', ') : item.days,
      });
    } else {
      setFormData({ status: 'active' });
    }
  }, [item]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number' && value !== '';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: keyof Schedule | 'servicePlanId', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      clientId: formData.clientId ? parseInt(String(formData.clientId), 10) : undefined,
      staffId: formData.staffId ? parseInt(String(formData.staffId), 10) : undefined,
      servicePlanId: formData.servicePlanId ? parseInt(String(formData.servicePlanId), 10) : undefined,
      days: typeof formData.days === 'string' ? formData.days.split(',').map(d => d.trim()) : formData.days,
    };
    onSubmit(dataToSubmit);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Client</label>
              <Select value={String(formData.clientId || '')} onValueChange={(value) => handleSelectChange('clientId', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Assigned Staff</label>
              <Select value={String(formData.staffId || '')} onValueChange={(value) => handleSelectChange('staffId', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Service Plan</label>
              <Select value={String(formData.servicePlanId || '')} onValueChange={(value) => handleSelectChange('servicePlanId', value)} required disabled={!formData.clientId}>
                <SelectTrigger><SelectValue placeholder="Select Service Plan" /></SelectTrigger>
                <SelectContent>
                  {clientServicePlans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.planName} ({p.billingCode})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Service Code</label>
                <Input value={selectedServicePlan?.billingCode || ''} readOnly placeholder="Service Billing Code" />
            </div>
        </div>
        <div className="border p-4 rounded-md">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Service Plan Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                    <Input type="date" value={selectedServicePlan?.startDate || ''} readOnly />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                    <Input type="date" value={selectedServicePlan?.endDate || ''} readOnly />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Total Auth. Units</label>
                <Input type="number" name="totalUnits" value={formData.totalUnits || ''} onChange={handleChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Hours Per Day</label>
                <Input type="number" name="hoursPerDay" value={formData.hoursPerDay || ''} onChange={handleChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Frequency</label>
                <Select value={formData.frequency || ""} onValueChange={(value) => handleSelectChange('frequency', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select Frequency" /></SelectTrigger>
                    <SelectContent>
                       {['Daily', 'Weekly', 'Monthly', 'Bi-Weekly'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Schedule Start Date</label>
                <Input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
            </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Schedule End Date</label>
                <Input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} required />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Time In (AM)</label>
                <Input type="time" name="timeInAM" value={formData.timeInAM || ''} onChange={handleChange} />
            </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Time Out (AM)</label>
                <Input type="time" name="timeOutAM" value={formData.timeOutAM || ''} onChange={handleChange} />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Time In (PM)</label>
                <Input type="time" name="timeInPM" value={formData.timeInPM || ''} onChange={handleChange} />
            </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Time Out (PM)</label>
                <Input type="time" name="timeOutPM" value={formData.timeOutPM || ''} onChange={handleChange} />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Service Days</label>
            <Input name="days" value={formData.days as string || ''} onChange={handleChange} placeholder="e.g. Monday, Wednesday, Friday" required />
        </div>
         <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <Select value={formData.status || ""} onValueChange={(value) => handleSelectChange('status', value as 'active' | 'expired' | 'pending')} required>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                    {['active', 'pending', 'expired'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {item ? 'Save Changes' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
}
