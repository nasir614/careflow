'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Bot } from 'lucide-react';
import type { Schedule } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';

interface ScheduleFormProps {
  item: Schedule | null;
  onSubmit: (data: Partial<Schedule>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ScheduleForm({ item, onSubmit, isLoading, onCancel }: ScheduleFormProps) {
  const { clients, staff, openModal } = useCareFlow();
  const [formData, setFormData] = useState<Partial<Schedule>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        days: Array.isArray(item.days) ? item.days.join(', ') : item.days,
      });
    } else {
      setFormData({ status: 'active' });
    }
  }, [item]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, valueAsNumber } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? valueAsNumber : value }));
  };

  const handleSelectChange = (name: keyof Schedule, value: string) => {
    const isClient = name === 'clientName';
    const isStaff = name === 'staffName';
    
    let updatedData = { ...formData, [name]: value };

    if (isClient) {
        const client = clients.find(c => `${c.firstName} ${c.lastName}` === value);
        if (client) {
            updatedData = { ...updatedData, clientId: client.id };
        }
    }
    if (isStaff) {
        const staffMember = staff.find(s => s.name === value);
        if (staffMember) {
            updatedData = { ...updatedData, staffId: staffMember.id };
        }
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
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
              <Select value={formData.clientName || ""} onValueChange={(value) => handleSelectChange('clientName', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={`${c.firstName} ${c.lastName}`}>{c.firstName} {c.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Assigned Staff</label>
              <Select value={formData.staffName || ""} onValueChange={(value) => handleSelectChange('staffName', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
               <Button type="button" size="sm" variant="ghost" className="absolute -right-1 top-6 text-primary hover:text-primary" onClick={() => openModal('suggest-caregiver', 'schedules')}>
                <Bot className="w-4 h-4 mr-1" /> Suggest
              </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Service Type</label>
                <Select value={formData.serviceType || ""} onValueChange={(value) => handleSelectChange('serviceType', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                    <SelectContent>
                        {['Adult Day Care', 'Personal Care', 'Day Support', 'Respite Care'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Service Code</label>
                <Select value={formData.serviceCode || ""} onValueChange={(value) => handleSelectChange('serviceCode', value)} required>
                    <SelectTrigger><SelectValue placeholder="Select Code" /></SelectTrigger>
                    <SelectContent>
                       {['T2021', 'T1019', 'S5150', 'T1005'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                <Input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
            </div>
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                <Input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} required />
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
                    {['active', 'expired', 'pending'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
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
