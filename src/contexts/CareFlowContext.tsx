"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { initialClients, initialStaff, initialAttendance, initialCompliance, initialBilling, initialTransportation, initialSchedules, initialStaffCredentials } from '@/lib/data';
import type { Client, Staff, Attendance, Compliance, Billing, Transportation, Schedule, DataModule, AnyData, StaffCredential } from '@/lib/types';

type ModalType = 'add' | 'edit' | 'view' | 'delete' | '';

interface CareFlowContextType {
  // State
  clients: Client[];
  staff: Staff[];
  attendance: Attendance[];
  compliance: Compliance[];
  billing: Billing[];
  transportation: Transportation[];
  schedules: Schedule[];
  staffCredentials: StaffCredential[];
  
  // Handlers
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setStaffCredentials: React.Dispatch<React.SetStateAction<StaffCredential[]>>;
  
  // Modal State
  modalOpen: boolean;
  modalType: ModalType;
  activeModule: DataModule | null;
  selectedItem: AnyData | null;
  
  // Modal Handlers
  openModal: (type: ModalType, module: DataModule, item?: AnyData | null) => void;
  closeModal: () => void;
  
  // CRUD
  handleCRUD: (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item?: AnyData | null) => void;
  isLoading: boolean;
}

const CareFlowContext = createContext<CareFlowContextType | undefined>(undefined);

const calculateTotalHours = (data: Partial<Attendance>): number => {
    let totalMinutes = 0;

    const timeToMinutes = (time: string) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const amIn = timeToMinutes(data.checkInAM || '');
    const amOut = timeToMinutes(data.checkOutAM || '');
    const pmIn = timeToMinutes(data.checkInPM || '');
    const pmOut = timeToMinutes(data.checkOutPM || '');

    if (amOut > amIn) {
        totalMinutes += amOut - amIn;
    }
    if (pmOut > pmIn) {
        totalMinutes += pmOut - pmIn;
    }

    return totalMinutes / 60;
};

export const CareFlowProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Main data states
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [compliance, setCompliance] = useState<Compliance[]>(initialCompliance);
  const [billing, setBilling] = useState<Billing[]>(initialBilling);
  const [transportation, setTransportation] = useState<Transportation[]>(initialTransportation);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [staffCredentials, setStaffCredentials] = useState<StaffCredential[]>(initialStaffCredentials);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [activeModule, setActiveModule] = useState<DataModule | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnyData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (type: ModalType, module: DataModule, item: AnyData | null = null) => {
    setModalType(type);
    setActiveModule(module);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // A slight delay to allow the dialog to animate out
    setTimeout(() => {
      setModalType('');
      setActiveModule(null);
      setSelectedItem(null);
    }, 200);
  };

  const handleCRUD = (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item: AnyData | null = null) => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API delay
      const getSingularModuleName = (moduleName: string) => {
        if (moduleName === 'staffCredentials') return 'Staff Credential';
        if (moduleName === 'staff') return 'Staff Member';
        if (moduleName.endsWith('s')) return moduleName.slice(0, -1);
        return moduleName;
      }
      const singularModule = getSingularModuleName(module);
      const capitalizedModule = singularModule.charAt(0).toUpperCase() + singularModule.slice(1);

      const findClientName = (clientId: number | string) => {
        const client = clients.find(c => String(c.id) === String(clientId));
        return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
      }

      if (action === 'add') {
        let newItem: any = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
        switch(module) {
          case 'clients': 
            setClients(prev => [...prev, { ...newItem, createdAt: new Date().toISOString().slice(0, 10) }]); 
            break;
          case 'staff': 
            setStaff(prev => [...prev, newItem]); 
            break;
          case 'schedules': 
            setSchedules(prev => [...prev, { ...newItem, usedUnits: 0, createdAt: new Date().toISOString().slice(0, 10) }]); 
            break;
          case 'staffCredentials': 
            setStaffCredentials(prev => [...prev, newItem]); 
            break;
          case 'attendance': 
            const client = clients.find(c => String(c.id) === String(newItem.clientId));
            const staffMember = staff.find(s => String(s.id) === String(newItem.staffId));
            newItem = {
                ...newItem,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
                staffName: staffMember ? staffMember.name : 'Unknown',
                totalHours: calculateTotalHours(newItem)
            };
            setAttendance(prev => [...prev, newItem]);
            break;
          case 'compliance': setCompliance(prev => [...prev, newItem]); break;
          case 'billing':
            newItem = {
              ...newItem,
              invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
              amount: (data.units || 0) * (data.rate || 0),
              clientName: findClientName(newItem.clientId),
            };
            setBilling(prev => [...prev, newItem]); 
            break;
          case 'transportation': setTransportation(prev => [...prev, newItem]); break;
        }
        toast({ title: "Success", description: `${capitalizedModule} added successfully!` });
      } else if (action === 'edit' && item) {
        let updatedItem = { ...item, ...data };
        switch(module) {
          case 'clients': setClients(prev => prev.map(c => c.id === item.id ? updatedItem as Client : c)); break;
          case 'staff': setStaff(prev => prev.map(s => s.id === item.id ? updatedItem as Staff : s)); break;
          case 'schedules': setSchedules(prev => prev.map(s => s.id === item.id ? updatedItem as Schedule : s)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.map(s => s.id === item.id ? updatedItem as StaffCredential : s)); break;
          case 'attendance': 
            const client = clients.find(c => String(c.id) === String(updatedItem.clientId));
            const staffMember = staff.find(s => String(s.id) === String(updatedItem.staffId));
            updatedItem = {
                ...updatedItem,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
                staffName: staffMember ? staffMember.name : 'Unknown',
                totalHours: calculateTotalHours(updatedItem)
            };
            setAttendance(prev => prev.map(a => a.id === item.id ? updatedItem as Attendance : a)); 
            break;
          case 'compliance': setCompliance(prev => prev.map(c => c.id === item.id ? updatedItem as Compliance : c)); break;
          case 'billing': 
             updatedItem = {
              ...updatedItem,
              amount: (data.units || item.units) * (data.rate || item.rate),
              clientName: findClientName(updatedItem.clientId),
            };
            setBilling(prev => prev.map(b => b.id === item.id ? updatedItem as Billing : b)); 
            break;
          case 'transportation': setTransportation(prev => prev.map(t => t.id === item.id ? updatedItem as Transportation : t)); break;
        }
        toast({ title: "Success", description: `${capitalizedModule} updated successfully!` });
      } else if (action === 'delete' && item) {
        switch(module) {
          case 'clients': setClients(prev => prev.filter(c => c.id !== item.id)); break;
          case 'staff': setStaff(prev => prev.filter(s => s.id !== item.id)); break;
          case 'schedules': setSchedules(prev => prev.filter(s => s.id !== item.id)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.filter(c => c.id !== item.id)); break;
          case 'attendance': setAttendance(prev => prev.filter(a => a.id !== item.id)); break;
          case 'compliance': setCompliance(prev => prev.filter(c => c.id !== item.id)); break;
          case 'billing': setBilling(prev => prev.filter(b => b.id !== item.id)); break;
          case 'transportation': setTransportation(prev => prev.filter(t => t.id !== item.id)); break;
        }
        toast({ title: "Success", description: `${capitalizedModule} deleted successfully.` });
      }
      
      closeModal();
      setIsLoading(false);
    }, 800);
  };
  
  const value = {
    clients,
    staff,
    attendance,
    compliance,
    billing,
    transportation,
    schedules,
    staffCredentials,
    setClients,
    setStaff,
    setSchedules,
    setStaffCredentials,
    modalOpen,
    modalType,
    activeModule,
    selectedItem,
    openModal,
    closeModal,
    handleCRUD,
    isLoading,
  };

  return (
    <CareFlowContext.Provider value={value}>
      {children}
    </CareFlowContext.Provider>
  );
};

export const useCareFlow = () => {
  const context = useContext(CareFlowContext);
  if (context === undefined) {
    throw new Error('useCareFlow must be used within a CareFlowProvider');
  }
  return context;
};
