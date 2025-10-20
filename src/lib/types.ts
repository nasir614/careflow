export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  providerName: string;
  caseManager: string;
  caseManagerPhone: string;
  caseManagerEmail: string;
  insurance: string;
  status: 'active' | 'inactive';
  createdAt: string;
  dob?: string;
  gender?: string;
  medicaidId?: string;
  insuranceSecondary?: string;
};

export type Staff = {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: 'Active' | 'Inactive';
  schedule: string;
  department: 'Medical' | 'Care' | 'Administration';
};

export type StaffCredential = {
  id: number;
  staffId: number;
  credential: string;
  training: string;
  hrDocument: string;
  startDate: string;
  expirationDate: string | null;
  renewalDate: string | null;
  isCritical: boolean;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  actionTaken: string | null;
};

export type Attendance = {
  id: number;
  clientId: number;
  staffId: number;
  serviceType: string;
  date: string;
  checkInAM: string | null;
  checkOutAM: string | null;
  checkInPM: string | null;
  checkOutPM: string | null;
  totalHours: number;
  location: string;
  billingCode: string;
  status: 'present' | 'absent' | 'excused';
  notes: string | null;
  createdAt: string;
};

export type Compliance = {
  id: number;
  clientId: number;
  type: 'Authorization' | 'Document' | 'Certification';
  item: string;
  status: 'Current' | 'Expiring Soon' | 'Expired';
  dueDate: string;
  daysLeft: number;
};

export type Billing = {
  id: number;
  invoiceNo: string;
  clientId: number;
  scheduleId: number;
  serviceDate: string;
  serviceType: string;
  serviceCode: string;
  units: number;
  rate: number;
  amount: number;
  status: 'Pending' | 'Submitted' | 'Paid' | 'Denied';
  createdAt: string;
  sourceLogId?: string; // e.g., 'att-123' or 'trans-456'
};

export type Transportation = {
  id: number;
  clientId: number;
  driverId: number;
  pickup: string;
  dropoff: string;
  route: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Canceled';
  date: string;
};

export type Schedule = {
  id: number;
  clientId: number;
  staffId: number;
  servicePlanId: number;
  serviceType: string;
  serviceCode: string;
  frequency: string;
  totalUnits: number;
  usedUnits: number;
  hoursPerDay: number;
  startDate: string;
  endDate: string;
  days: string[];
  timeInAM?: string;
  timeOutAM?: string;
  timeInPM?: string;
  timeOutPM?: string;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
};

export type PlanStatus = 'Active' | 'Pending' | 'Expired' | 'Inactive';

export type ServicePlan = {
  id: number;
  clientId: number;
  planName: string;
  type: 'Medical' | 'Personal Care' | 'Social';
  billingCode: string;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  notes?: string;
};

export type CarePlan = {
  id: number;
  clientId: number;
  planName: string;
  assignedStaffId: number;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  goals: string;
  notes?: string;
};

export type Authorization = {
  id: number;
  clientId: number;
  servicePlanId: number;
  authorizedHours: number;
  usedHours: number;
  startDate: string;
endDate: string;
  status: PlanStatus;
  notes?: string;
};

// Enriched types for display purposes
export type EnrichedSchedule = Schedule & { clientName: string; staffName: string; };
export type EnrichedAttendance = Attendance & { clientName: string; staffName: string; };
export type EnrichedBilling = Billing & { clientName: string; };
export type EnrichedTransportation = Transportation & { client: string; driver: string; };
export type EnrichedCarePlan = CarePlan & { clientName: string; assignedStaff: string; };
export type EnrichedServicePlan = ServicePlan & { clientName: string; };
export type EnrichedAuthorization = Authorization & { clientName: string; servicePlan: string; serviceType: string; billingCode: string; };
export type EnrichedCompliance = Compliance & { client: string; };
export type EnrichedStaffCredential = StaffCredential & { staffName: string; role: string; };


export type DataModule = 'clients' | 'staff' | 'schedules' | 'compliance' | 'billing' | 'transportation' | 'staffCredentials' | 'servicePlans' | 'carePlans' | 'authorizations' | 'attendance';

export type AnyData = Client | Staff | Schedule | Compliance | Billing | Transportation | StaffCredential | ServicePlan | CarePlan | Authorization | Attendance | EnrichedSchedule | EnrichedAttendance | EnrichedBilling | EnrichedTransportation | EnrichedCarePlan | EnrichedServicePlan | EnrichedAuthorization | EnrichedCompliance | EnrichedStaffCredential;
