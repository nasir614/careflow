'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import type { BulkAttendanceData, AttendanceStatus } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';

interface BulkAttendanceFormProps {
  onSubmit: (data: BulkAttendanceData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function BulkAttendanceForm({ onSubmit, isLoading, onCancel }: BulkAttendanceFormProps) {
  const { clients, staff } = useCareFlow();
  const [formData, setFormData] = useState<Partial<BulkAttendanceData>>({
    clientIds: [],
    status: 'present',
    serviceType: 'Adult Day Care',
    location: 'Daycare Center',
  });
  const [selectAllClients, setSelectAllClients] = useState(false);

  const serviceTypeOptions = ['Adult Day Care', 'Personal Care', 'Day Support', 'Respite Care'];
  const attendanceStatusOptions: {value: AttendanceStatus, label: string}[] = [
    { value: 'present', label: 'Present' },
    { value: 'excused', label: 'Excused' },
    { value: 'absent', label: 'Absent (General)' },
    { value: 'absent_hospital', label: 'Absent (Hospital)' },
    { value: 'absent_travel', label: 'Absent (Travel)' },
    { value: 'absent_personal', label: 'Absent (Personal)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof BulkAttendanceData, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelection = (clientId: number) => {
    setFormData(prev => {
        const clientIds = prev.clientIds || [];
        if (clientIds.includes(clientId)) {
            return { ...prev, clientIds: clientIds.filter(id => id !== clientId) };
        } else {
            return { ...prev, clientIds: [...clientIds, clientId] };
        }
    });
  };

  const handleSelectAllClients = (checked: boolean) => {
    setSelectAllClients(checked);
    if (checked) {
        setFormData(prev => ({ ...prev, clientIds: clients.map(c => c.id) }));
    } else {
        setFormData(prev => ({ ...prev, clientIds: [] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientIds || formData.clientIds.length === 0) {
        // You might want to show a toast message here
        console.error("No clients selected");
        return;
    }
    onSubmit(formData as BulkAttendanceData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 p-1">
        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Select Clients</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox id="selectAll" checked={selectAllClients} onCheckedChange={handleSelectAllClients} />
            <Label htmlFor="selectAll" className="font-medium">Select All Clients</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {clients.map(client => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={formData.clientIds?.includes(client.id)}
                  onCheckedChange={() => handleClientSelection(client.id)}
                />
                <Label htmlFor={`client-${client.id}`} className="text-sm font-normal">
                  {client.firstName} {client.lastName}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Log Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" name="startDate" onChange={handleChange} required />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" name="endDate" onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
              <Label>Assigned Staff</Label>
              <Select onValueChange={(value) => handleSelectChange('staffId', parseInt(value))} required>
                <SelectTrigger><SelectValue placeholder="Select Staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service Type</Label>
              <Select value={formData.serviceType} onValueChange={(value) => handleSelectChange('serviceType', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                <SelectContent>
                    {serviceTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label>Location</Label>
              <Input name="location" value={formData.location || ''} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Time & Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><Label>Check In (AM)</Label><Input type="time" name="checkInAM" onChange={handleChange} /></div>
            <div><Label>Check Out (AM)</Label><Input type="time" name="checkOutAM" onChange={handleChange} /></div>
            <div><Label>Check In (PM)</Label><Input type="time" name="checkInPM" onChange={handleChange} /></div>
            <div><Label>Check Out (PM)</Label><Input type="time" name="checkOutPM" onChange={handleChange} /></div>
          </div>
          <div className="mt-4">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value as AttendanceStatus)} required>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                    {attendanceStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea name="notes" onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Generate Logs
        </Button>
      </div>
    </form>
  );
}
