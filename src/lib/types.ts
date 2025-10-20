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
  serviceCode: string;
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
  staffName: string;
  role: string;
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

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'absent_hospital' | 'absent_travel' | 'absent_personal';

export type Attendance = {
  id: number;
  clientId: number;
  clientName: string;
  staffId: number;
  staffName: string;
  serviceType: string;
  date: string;
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  totalHours: number;
  location: string;
  billingCode: string;
  status: AttendanceStatus;
  notes: string;
  createdAt: string;
};

export type Compliance = {
  id: number;
  client: string;
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
  clientName: string;
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
  client: string;
  driver: string;
  pickup: string;
  dropoff: string;
  route: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Canceled';
  date: string;
};

export type Schedule = {
  id: number;
  clientId: number;
  clientName: string;
  staffId: number;
  staffName: string;
  serviceType: string;
  serviceCode: string;
  frequency: string;
  totalUnits: number;
  usedUnits: number;
  hoursPerDay: number;
  startDate: string;
  endDate: string;
  days: string[];
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
};

export type PlanStatus = 'Active' | 'Pending' | 'Expired' | 'Inactive';

export type ServicePlan = {
  id: number;
  clientId: number;
  clientName: string;
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
  clientName: string;
  planName: string;
  assignedStaffId: number;
  assignedStaff: string;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  goals: string;
  notes?: string;
};

export type Authorization = {
  id: number;
  clientId: number;
  clientName: string;
  servicePlanId: number;
  servicePlan: string;
  serviceType: string;
  billingCode: string;
  authorizedHours: number;
  usedHours: number;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  notes?: string;
};

export type DataModule = 'clients' | 'staff' | 'schedules' | 'attendance' | 'compliance' | 'billing' | 'transportation' | 'staffCredentials' | 'servicePlans' | 'carePlans' | 'authorizations';

export type AnyData = Client | Staff | Schedule | Attendance | Compliance | Billing | Transportation | StaffCredential | ServicePlan | CarePlan | Authorization;
