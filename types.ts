export enum Shift {
  MORNING = 'เช้า (08:00 - 16:00)',
  AFTERNOON = 'บ่าย (16:00 - 24:00)',
  NIGHT = 'ดึก (24:00 - 08:00)',
}

export enum LogStatus {
  NORMAL = 'ปกติ',
  WARNING = 'เฝ้าระวัง',
  CRITICAL = 'วิกฤต/ขัดข้อง',
  MAINTENANCE = 'บำรุงรักษา',
}

export interface LogEntry {
  id: string;
  timestamp: string; // ISO String
  operatorName: string;
  shift: Shift;
  systemName: string; // e.g., Server A, Database Cluster, Network Switch
  operationType: string; // e.g., Daily Check, Batch Job, Backup
  description: string;
  status: LogStatus;
  notes?: string;
}

export interface AIAnalysisResult {
  summary: string;
  issuesFound: string[];
  recommendations: string;
}
