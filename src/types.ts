export interface Mission {
  id: string;
  inspectorName: string;      // إسم السيد المفتش
  rentalNumber: string;       // رقم التأجير
  missionType: string;        // نوع المهمة
  missionDate: string;        // التاريخ (YYYY-MM-DD)
  destination1: string;       // الاتجاه (1)
  destination2?: string;      // الاتجاه (2)
  destination3?: string;      // الاتجاه (3)
  companion1?: string;        // إسم المرافق (1)
  companion2?: string;        // إسم المرافق (2)
  companion3?: string;        // إسم المرافق (3)
  notes?: string;             // ملاحظات
  status: 'completed' | 'in_progress' | 'scheduled'; // حالة المهمة
  createdAt: string;
  updatedAt: string;
}

export type MissionFormData = Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>;

export interface MissionFilters {
  searchQuery: string;
  missionType: string;
  inspectorName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export type SyncState = 'connected' | 'syncing' | 'offline' | 'error';

export interface SyncInfo {
  state: SyncState;
  lastSyncedAt: string | null;
  pendingCount: number;
  totalCount: number;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  total_private_repos?: number;
  bio?: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  description: string | null;
  updated_at: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  repoUrl?: string;
  filesCount?: number;
  message?: string;
  error?: string;
}

export interface GitHubStatusResponse {
  connected: boolean;
  user: GitHubUser | null;
  hasEnvToken: boolean;
}
