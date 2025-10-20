'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  initialClients, 
  initialStaff, 
  initialCompliance, 
  initialBilling, 
  initialTransportation, 
  initialSchedules, 
  initialStaffCredentials,
  initialServicePlans,
  initialCarePlans,
  initialAuthorizations,
  initialAttendance
} from '@/lib/data';
import type { 
  Client, 
  Staff, 
  Compliance, 
  Billing, 
  Transportation, 
  Schedule, 
  DataModule, 
  AnyData, 
  StaffCredential,
  ServicePlan,
  CarePlan,
  Authorization,
  Attendance,
  EnrichedSchedule,
  EnrichedAttendance,
  EnrichedBilling,
  EnrichedTransportation,
  EnrichedCarePlan,
  EnrichedServicePlan,
  EnrichedAuthorization,
  EnrichedCompliance,
  EnrichedStaffCredential
} from '@/lib/types';
import { eachDayOfInterval, format, isMatch, parse, differenceInMinutes, isValid } from 'date-fns';

type ModalType = 'add' | 'edit' | 'view' | 'delete' | '';

// Define rates for services
const SERVICE_RATES: { [key: string]: number } = {
    'Adult Day Care': 25, // per hour
    'Personal Care': 30, // per hour
    'Day Support': 28, // per hour
    'Respite Care': 35, // per hour
    'Transportation': 50, // per trip
};

interface CareFlowContextType {
  // State
  clients: Client[];
  staff: Staff[];
  attendance: EnrichedAttendance[];
  compliance: EnrichedCompliance[];
  billing: EnrichedBilling[];
  transportation: EnrichedTransportation[];
  schedules: EnrichedSchedule[];
  staffCredentials: EnrichedStaffCredential[];
  servicePlans: EnrichedServicePlan[];
  carePlans: EnrichedCarePlan[];
  authorizations: EnrichedAuthorization[];
  
  // Handlers
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setStaffCredentials: React.Dispatch<React.SetStateAction<StaffCredential[]>>;
  setServicePlans: React.Dispatch<React.SetStateAction<ServicePlan[]>>;
  setCarePlans: React.Dispatch<React.SetStateAction<CarePlan[]>>;
  setAuthorizations: React.Dispatch<React.SetStateAction<Authorization[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  
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

  // New billing automation
  generateInvoicesFromLogs: () => void;
}

const CareFlowContext = createContext<CareFlowContextType | undefined>(undefined);


export const CareFlowProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Main data states
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [rawAttendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [rawCompliance, setCompliance] = useState<Compliance[]>(initialCompliance);
  const [rawBilling, setBilling] = useState<Billing[]>(initialBilling);
  const [rawTransportation, setTransportation] = useState<Transportation[]>(initialTransportation);
  const [rawSchedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [rawStaffCredentials, setStaffCredentials] = useState<StaffCredential[]>(initialStaffCredentials);
  const [rawServicePlans, setServicePlans] = useState<ServicePlan[]>(initialServicePlans);
  const [rawCarePlans, setCarePlans] = useState<CarePlan[]>(initialCarePlans);
  const [rawAuthorizations, setAuthorizations] = useState<Authorization[]>(initialAuthorizations);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [activeModule, setActiveModule] = useState<DataModule | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnyData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, `${c.firstName} ${c.lastName}`])), [clients]);
  const staffMap = useMemo(() => new Map(staff.map(s => [s.id, { name: s.name, role: s.role }])), [staff]);
  const servicePlansMap = useMemo(() => new Map(rawServicePlans.map(p => [p.id, p])), [rawServicePlans]);

  const enrichedSchedules = useMemo(() => rawSchedules.map(s => ({
    ...s,
    clientName: clientsMap.get(s.clientId) || 'Unknown Client',
    staffName: staffMap.get(s.staffId)?.name || 'Unknown Staff',
  })), [rawSchedules, clientsMap, staffMap]);

  const enrichedAttendance = useMemo(() => rawAttendance.map(a => ({
    ...a,
    clientName: clientsMap.get(a.clientId) || 'Unknown Client',
    staffName: staffMap.get(a.staffId)?.name || 'Unknown Staff',
  })), [rawAttendance, clientsMap, staffMap]);

  const enrichedBilling = useMemo(() => rawBilling.map(b => ({
    ...b,
    clientName: clientsMap.get(b.clientId) || 'Unknown Client',
  })), [rawBilling, clientsMap]);
  
  const enrichedTransportation = useMemo(() => rawTransportation.map(t => ({
    ...t,
    client: clientsMap.get(t.clientId) || 'Unknown Client',
    driver: staffMap.get(t.driverId)?.name || 'Unknown Driver',
  })), [rawTransportation, clientsMap, staffMap]);

  const enrichedCarePlans = useMemo(() => rawCarePlans.map(cp => ({
    ...cp,
    clientName: clientsMap.get(cp.clientId) || 'Unknown Client',
    assignedStaff: staffMap.get(cp.assignedStaffId)?.name || 'Unknown Staff',
  })), [rawCarePlans, clientsMap, staffMap]);
  
  const enrichedServicePlans = useMemo(() => rawServicePlans.map(sp => ({
    ...sp,
    clientName: clientsMap.get(sp.clientId) || 'Unknown Client',
  })), [rawServicePlans, clientsMap]);

  const enrichedAuthorizations = useMemo(() => rawAuthorizations.map(auth => {
    const plan = servicePlansMap.get(auth.servicePlanId);
    return {
      ...auth,
      clientName: clientsMap.get(auth.clientId) || 'Unknown Client',
      servicePlan: plan?.planName || 'N/A',
      serviceType: plan?.type || 'N/A',
      billingCode: plan?.billingCode || 'N/A',
    }
  }), [rawAuthorizations, clientsMap, servicePlansMap]);

  const enrichedCompliance = useMemo(() => rawCompliance.map(c => ({
    ...c,
    client: clientsMap.get(c.clientId) || 'Unknown Client',
  })), [rawCompliance, clientsMap]);
  
  const enrichedStaffCredentials = useMemo(() => rawStaffCredentials.map(sc => {
      const staffMember = staffMap.get(sc.staffId);
      return {
          ...sc,
          staffName: staffMember?.name || 'Unknown Staff',
          role: staffMember?.role || 'Unknown Role',
      };
  }), [rawStaffCredentials, staffMap]);

  const openModal = (type: ModalType, module: DataModule, item: AnyData | null = null) => {
    setModalType(type);
    setActiveModule(module);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalType('');
      setActiveModule(null);
      setSelectedItem(null);
    }, 200);
  };

  const generateInvoicesFromLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      let newInvoices: Billing[] = [];
      let generatedCount = 0;

      rawTransportation.forEach(trans => {
        const alreadyBilled = rawBilling.some(b => b.sourceLogId === `trans-${trans.id}`);
        if (trans.status === 'Completed' && !alreadyBilled) {
            const client = clients.find(c => c.id === trans.clientId);
            const rate = SERVICE_RATES['Transportation'] || 0;
            if(client && rate > 0) {
              newInvoices.push({
                id: Date.now() + generatedCount,
                invoiceNo: `INV-${Date.now().toString().slice(-6) + generatedCount}`,
                clientId: client.id,
                scheduleId: 0, 
                serviceDate: trans.date,
                serviceType: 'Transportation',
                serviceCode: 'A0120', 
                units: 1, 
                rate: rate,
                amount: rate,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                sourceLogId: `trans-${trans.id}`,
              });
              generatedCount++;
            }
        }
      });

      if (newInvoices.length > 0) {
        setBilling(prev => [...prev, ...newInvoices]);
        toast({ title: "Invoices Generated", description: `${generatedCount} new draft invoice(s) have been created.` });
      } else {
        toast({ title: "No New Invoices", description: "All completed services have already been invoiced." });
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleBulkAddAttendance = (data: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const { client, staff, serviceType, billingCode, logs } = data;
      let createdCount = 0;
      let updatedCount = 0;

      const newAttendanceLogs: Attendance[] = [];
      const updatedAttendanceLogs = new Map<number, Attendance>();
      
      let nextId = Math.max(...rawAttendance.map(a => a.id), 0) + 1;

      logs.forEach((log: any) => {
          if (log.status !== 'present' && !log.notes) {
              return; 
          }
          if (log.status === 'present' && (!log.checkInAM || !log.checkOutAM)) {
              return;
          }

          const calculateHours = (timeInStr: string, timeOutStr: string) => {
            if (!timeInStr || !timeOutStr) return 0;
            const timeIn = parse(timeInStr, 'HH:mm', new Date());
            const timeOut = parse(timeOutStr, 'HH:mm', new Date());
            if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
                return differenceInMinutes(timeOut, timeIn) / 60;
            }
            return 0;
          };

          const totalHours = calculateHours(log.checkInAM, log.checkOutAM) + calculateHours(log.checkInPM, log.checkOutPM);
          
          const existingLog = rawAttendance.find(a => 
            a.clientId === client.id && 
            format(new Date(a.date + 'T00:00:00'), 'yyyy-MM-dd') === log.date
          );
          
          const attendanceEntry: Omit<Attendance, 'id'> = {
            clientId: client.id,
            staffId: staff.id,
            serviceType: serviceType,
            date: log.date,
            checkInAM: log.checkInAM,
            checkOutAM: log.checkOutAM,
            checkInPM: log.checkInPM,
            checkOutPM: log.checkOutPM,
            totalHours: totalHours,
            location: 'Daycare Center',
            billingCode: billingCode,
            status: log.status,
            notes: log.notes,
            procedures: log.procedures,
            isBillable: log.isBillable,
            adminStatus: log.adminStatus,
            createdAt: new Date().toISOString(),
          };

          if (existingLog) {
              updatedAttendanceLogs.set(existingLog.id, { ...existingLog, ...attendanceEntry, id: existingLog.id });
              updatedCount++;
          } else {
              newAttendanceLogs.push({ ...attendanceEntry, id: nextId++ });
              createdCount++;
          }
      });

      setAttendance(prev => {
          const updatedPrev = prev.map(p => updatedAttendanceLogs.has(p.id) ? updatedAttendanceLogs.get(p.id)! : p);
          return [...updatedPrev, ...newAttendanceLogs];
      });

      toast({ title: 'Attendance Processed', description: `${createdCount} logs created, ${updatedCount} logs updated.` });
      closeModal();
      setIsLoading(false);
    }, 800);
  };


  const handleCRUD = (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item: AnyData | null = null) => {
    setIsLoading(true);

    if(module === 'attendance' && (item as any)?.bulk) {
      handleBulkAddAttendance(data);
      return;
    }
    
    setTimeout(() => { // Simulate API delay
      const getSingularModuleName = (moduleName: string) => {
        if (moduleName === 'staffCredentials') return 'Staff Credential';
        if (moduleName.endsWith('ies')) return moduleName.slice(0, -3) + 'y';
        if (moduleName.endsWith('s')) return moduleName.slice(0, -1);
        return moduleName;
      }
      const singularModule = getSingularModuleName(module);
      const capitalizedModule = singularModule.charAt(0).toUpperCase() + singularModule.slice(1);

      if (action === 'add') {
        const getNextId = (items: {id: number}[]) => Math.max(0, ...items.map(i => i.id)) + 1;
        
        let newId;
        let newItem: any;

        switch(module) {
            case 'clients': 
              newId = getNextId(clients); 
              newItem = { id: newId, ...data, createdAt: new Date().toISOString() };
              setClients(prev => [...prev, newItem]); 
              break;
            case 'staff': 
              newId = getNextId(staff); 
              newItem = { id: newId, ...data };
              setStaff(prev => [...prev, newItem]); 
              break;
            case 'schedules': 
              newId = getNextId(rawSchedules);
              newItem = { id: newId, ...data, usedUnits: 0, createdAt: new Date().toISOString() };
              setSchedules(prev => [...prev, newItem]); 
              break;
            case 'staffCredentials': 
              newId = getNextId(rawStaffCredentials);
              newItem = { id: newId, ...data };
              setStaffCredentials(prev => [...prev, newItem]); 
              break;
            case 'servicePlans': 
              newId = getNextId(rawServicePlans);
              newItem = { id: newId, ...data };
              setServicePlans(prev => [...prev, newItem]); 
              break;
            case 'carePlans': 
              newId = getNextId(rawCarePlans);
              newItem = { id: newId, ...data };
              setCarePlans(prev => [...prev, newItem]); 
              break;
            case 'authorizations': 
              newId = getNextId(rawAuthorizations);
              newItem = { id: newId, ...data, usedHours: 0 };
              setAuthorizations(prev => [...prev, newItem]); 
              break;
            case 'compliance': 
              newId = getNextId(rawCompliance);
              newItem = { id: newId, ...data };
              setCompliance(prev => [...prev, newItem]); 
              break;
            case 'billing':
              newId = getNextId(rawBilling);
              newItem = { id: newId, ...data, invoiceNo: `INV-${String(newId).slice(-6)}`, amount: (data.units || 0) * (data.rate || 0), createdAt: new Date().toISOString() };
              setBilling(prev => [...prev, newItem]); 
              break;
            case 'transportation': 
              newId = getNextId(rawTransportation);
              newItem = { id: newId, ...data };
              setTransportation(prev => [...prev, newItem]); 
              break;
            case 'attendance':
              newId = getNextId(rawAttendance);
              const calculateHours = (timeInStr: string, timeOutStr: string) => {
                  if (!timeInStr || !timeOutStr) return 0;
                  const timeIn = parse(timeInStr, 'HH:mm', new Date());
                  const timeOut = parse(timeOutStr, 'HH:mm', new Date());
                  if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
                      return differenceInMinutes(timeOut, timeIn) / 60;
                  }
                  return 0;
              };
              newItem = { id: newId, ...data, totalHours: calculateHours(data.checkInAM, data.checkOutAM) + calculateHours(data.checkInPM, data.checkOutPM), location: 'Daycare Center', createdAt: new Date().toISOString() };
              setAttendance(prev => [...prev, newItem]);
              break;
        }
        toast({ title: "Success", description: `${capitalizedModule} added successfully!` });
      } else if (action === 'edit' && item) {
        const updatedItem = { ...item, ...data };
        switch(module) {
          case 'clients': setClients(prev => prev.map(c => c.id === item.id ? updatedItem as Client : c)); break;
          case 'staff': setStaff(prev => prev.map(s => s.id === item.id ? updatedItem as Staff : s)); break;
          case 'schedules': setSchedules(prev => prev.map(s => s.id === item.id ? updatedItem as Schedule : s)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.map(s => s.id === item.id ? updatedItem as StaffCredential : s)); break;
          case 'servicePlans': setServicePlans(prev => prev.map(p => p.id === item.id ? updatedItem as ServicePlan : p)); break;
          case 'carePlans': setCarePlans(prev => prev.map(p => p.id === item.id ? updatedItem as CarePlan : p)); break;
          case 'authorizations': setAuthorizations(prev => prev.map(a => a.id === item.id ? updatedItem as Authorization : a)); break;
          case 'compliance': setCompliance(prev => prev.map(c => c.id === item.id ? updatedItem as Compliance : c)); break;
          case 'billing': 
            const billingItem = item as Billing;
            const billingData = data as Partial<Billing>;
            updatedItem.amount = (billingData.units ?? billingItem.units) * (billingData.rate ?? billingItem.rate);
            setBilling(prev => prev.map(b => b.id === item.id ? updatedItem as Billing : b)); 
            break;
          case 'transportation': setTransportation(prev => prev.map(t => t.id === item.id ? updatedItem as Transportation : t)); break;
          case 'attendance':
             const calculateHours = (timeInStr: string, timeOutStr: string) => {
                if (!timeInStr || !timeOutStr) return 0;
                const timeIn = parse(timeInStr, 'HH:mm', new Date());
                const timeOut = parse(timeOutStr, 'HH:mm', new Date());
                if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
                    return differenceInMinutes(timeOut, timeIn) / 60;
                }
                return 0;
             };
             updatedItem.totalHours = calculateHours(data.checkInAM, data.checkOutAM) + calculateHours(data.checkInPM, data.checkOutPM);
             setAttendance(prev => prev.map(a => a.id === item.id ? updatedItem as Attendance : a));
             break;
        }
        toast({ title: "Success", description: `${capitalizedModule} updated successfully!` });
      } else if (action === 'delete' && item) {
        switch(module) {
          case 'clients': setClients(prev => prev.filter(c => c.id !== item.id)); break;
          case 'staff': setStaff(prev => prev.filter(s => s.id !== item.id)); break;
          case 'schedules': setSchedules(prev => prev.filter(s => s.id !== item.id)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.filter(c => c.id !== item.id)); break;
          case 'servicePlans': setServicePlans(prev => prev.filter(p => p.id !== item.id)); break;
          case 'carePlans': setCarePlans(prev => prev.filter(p => p.id !== item.id)); break;
          case 'authorizations': setAuthorizations(prev => prev.filter(a => a.id !== item.id)); break;
          case 'compliance': setCompliance(prev => prev.filter(c => c.id !== item.id)); break;
          case 'billing': setBilling(prev => prev.filter(b => b.id !== item.id)); break;
          case 'transportation': setTransportation(prev => prev.filter(t => t.id !== item.id)); break;
          case 'attendance': setAttendance(prev => prev.filter(a => a.id !== item.id)); break;
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
    attendance: enrichedAttendance,
    compliance: enrichedCompliance,
    billing: enrichedBilling,
    transportation: enrichedTransportation,
    schedules: enrichedSchedules,
    staffCredentials: enrichedStaffCredentials,
    servicePlans: enrichedServicePlans,
    carePlans: enrichedCarePlans,
    authorizations: enrichedAuthorizations,
    setClients,
    setStaff,
    setAttendance,
    setSchedules,
    setStaffCredentials,
    setServicePlans,
    setCarePlans,
    setAuthorizations,
    modalOpen,
    modalType,
    activeModule,
    selectedItem,
    openModal,
    closeModal,
    handleCRUD,
    isLoading,
    generateInvoicesFromLogs,
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
