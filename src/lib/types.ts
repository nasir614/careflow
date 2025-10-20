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
};

export type Staff = {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  schedule: string;
  department: 'Medical' | 'Care' | 'Administration';
  avatarUrl?: string;
};

export type Attendance = {
  id: number;
  clientId: number;
  clientName: string;
  staffId: number;
  staffName: string;
  date: string;
  checkInAM: string;
  checkOutAM: string;
  checkInPM: string;
  checkOutPM: string;
  totalHours: number;
  location: string;
  billingCode: string;
  status: 'present' | 'absent' | 'excused';
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
};

export type Transportation = {
  id: number;
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

export type DataModule = 'clients' | 'staff' | 'schedules' | 'attendance' | 'compliance' | 'billing' | 'transportation';

export type AnyData = Client | Staff | Schedule | Attendance | Compliance | Billing | Transportation;
