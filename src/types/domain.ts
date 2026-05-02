export type Company = {
  id: string;
  name: string;
  industry: string;
  compliance: number; // 0-100
  workers: number;
};

export type PilaStatus = "uploaded" | "pending" | "overdue";
export type PilaRecord = {
  id: string;
  companyId: string;
  companyName: string;
  month: string; // e.g. "May 2025"
  status: PilaStatus;
  uploadedAt?: string;
};

export type MedicalExam = {
  id: string;
  workerName: string;
  document: string;
  recommendations: string;
  restrictions: string;
  date: string;
};

export type RiskMatrix = {
  id: string;
  ciiu: string;
  description: string;
  generatedAt: string;
};

export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

export type PendingAction = {
  id: string;
  title: string;
  due: string;
  priority: "high" | "medium" | "low";
};
