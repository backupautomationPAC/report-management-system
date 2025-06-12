export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AE = 'AE',
  SUPERVISOR = 'SUPERVISOR',
  ACCOUNTING = 'ACCOUNTING',
}

export interface Report {
  id: string;
  title: string;
  clientName: string;
  reportPeriod: string;
  startDate: string;
  endDate: string;
  status: ReportStatus;
  content: string;
  fileUrl?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  approvals: Approval[];
  harvestData?: HarvestEntry[];
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  PENDING_AE = 'PENDING_AE',
  PENDING_SUPERVISOR = 'PENDING_SUPERVISOR',
  PENDING_ACCOUNTING = 'PENDING_ACCOUNTING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Approval {
  id: string;
  reportId: string;
  userId: string;
  user: User;
  status: ApprovalStatus;
  comments?: string;
  createdAt: string;
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface HarvestEntry {
  id: string;
  clientName: string;
  projectName: string;
  taskName: string;
  hours: number;
  date: string;
  notes?: string;
  userName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingApproval: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  recentReports: Report[];
}
