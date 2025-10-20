'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import type { Client } from '@/lib/types';

interface ClientFormProps {
  item: Client | null;
  onSubmit: (data: Partial<Client>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ClientForm({ item, onSubmit, isLoading, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ status: 'active' });
    }
  }, [item]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Client, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const renderField = (name: keyof Client, label: string, type: string = 'text', required: boolean = false, options?: string[]) => {
    if (type === 'select') {
      return (
        <div key={name}>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
          <Select value={formData[name] as string || ""} onValueChange={(value) => handleSelectChange(name, value)} required={required}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div key={name}>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
        <Input type={type} name={name} value={(formData[name] as string) || ''} onChange={handleChange} required={required} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 p-1">
        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('firstName', 'First Name', 'text', true)}
            {renderField('lastName', 'Last Name', 'text', true)}
            {renderField('dob', 'Date of Birth', 'date')}
            {renderField('gender', 'Gender', 'select', false, ['Male', 'Female', 'Other'])}
            {renderField('phone', 'Phone', 'tel', true)}
            {renderField('email', 'Email', 'email')}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">{renderField('address', 'Street Address', 'text', true)}</div>
            {renderField('city', 'City', 'text', true)}
            {renderField('state', 'State', 'text', true)}
            {renderField('zip', 'ZIP Code', 'text', true)}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Provider & Case Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">{renderField('providerName', 'Provider Agency', 'text', true)}</div>
            {renderField('caseManager', 'Case Manager Name', 'text', true)}
            {renderField('caseManagerPhone', 'Case Manager Phone', 'tel', true)}
            {renderField('caseManagerEmail', 'Case Manager Email', 'email', true)}
          </div>
        </div>

         <div>
          <h3 className="font-semibold text-foreground border-b pb-2 mb-4">Insurance & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('medicaidId', 'Medicaid ID', 'text')}
            {renderField('insurance', 'Primary Insurance', 'text')}
            {renderField('insuranceSecondary', 'Secondary Insurance', 'text')}
            {renderField('status', 'Status', 'select', true, ['active', 'inactive'])}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {item ? 'Save Changes' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}
