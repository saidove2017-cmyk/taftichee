import {
  Mission,
  MissionFormData,
  GitHubStatusResponse,
  GitHubUser,
  GitHubRepo,
  GitHubPushResult,
} from '../types';

const LOCAL_STORAGE_KEY = 'inspection_missions_cache_v1';

export function getLocalCachedMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [];
  }
}

export function setLocalCachedMissions(missions: Mission[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(missions));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

export async function fetchMissions(): Promise<Mission[]> {
  try {
    const res = await fetch('/api/missions');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.missions)) {
      setLocalCachedMissions(data.missions);
      return data.missions;
    }
  } catch (err) {
    console.warn('Network error fetching missions, using local cache:', err);
  }
  return getLocalCachedMissions();
}

export async function createMission(data: MissionFormData): Promise<Mission> {
  const localId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const temporaryMission: Mission = {
    ...data,
    id: localId,
    createdAt: now,
    updatedAt: now,
  };

  // Optimistic local update
  const current = getLocalCachedMissions();
  setLocalCachedMissions([temporaryMission, ...current]);

  try {
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create mission on server');
    const result = await res.json();
    if (result.success && result.mission) {
      // replace temporary with server confirmation
      const updated = getLocalCachedMissions().map(m => m.id === localId ? result.mission : m);
      setLocalCachedMissions(updated);
      return result.mission;
    }
  } catch (err) {
    console.error('Error saving to server, saved locally:', err);
  }

  return temporaryMission;
}

export async function updateMission(id: string, data: Partial<Mission>): Promise<Mission> {
  // Optimistic update
  const current = getLocalCachedMissions();
  const index = current.findIndex(m => m.id === id);
  let updatedMission: Mission;

  if (index !== -1) {
    updatedMission = {
      ...current[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    current[index] = updatedMission;
    setLocalCachedMissions([...current]);
  } else {
    updatedMission = data as Mission;
  }

  try {
    const res = await fetch(`/api/missions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update mission on server');
    const result = await res.json();
    if (result.success && result.mission) {
      return result.mission;
    }
  } catch (err) {
    console.error('Error updating mission on server:', err);
  }

  return updatedMission;
}

export async function deleteMission(id: string): Promise<boolean> {
  // Optimistic update
  const current = getLocalCachedMissions().filter(m => m.id !== id);
  setLocalCachedMissions(current);

  try {
    const res = await fetch(`/api/missions/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Error deleting mission on server:', err);
    return false;
  }
}

export async function bulkSyncMissions(missions: Mission[], mode: 'merge' | 'replace' = 'merge'): Promise<Mission[]> {
  try {
    const res = await fetch('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missions, mode }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.missions)) {
        setLocalCachedMissions(data.missions);
        return data.missions;
      }
    }
  } catch (err) {
    console.error('Bulk sync failed:', err);
  }
  setLocalCachedMissions(missions);
  return missions;
}

export function subscribeToRealtimeSync(onSyncMessage: (event: any) => void): () => void {
  if (typeof window === 'undefined' || !('EventSource' in window)) {
    return () => {};
  }

  let es: EventSource | null = null;
  let retryTimer: NodeJS.Timeout | null = null;

  function connect() {
    try {
      es = new EventSource('/api/sync/events');

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onSyncMessage(parsed);
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      es.onerror = () => {
        if (es) {
          es.close();
          es = null;
        }
        // Auto-reconnect after 3 seconds
        if (!retryTimer) {
          retryTimer = setTimeout(() => {
            retryTimer = null;
            connect();
          }, 3000);
        }
      };
    } catch (err) {
      console.warn('Failed to establish EventSource:', err);
    }
  }

  connect();

  return () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (es) es.close();
  };
}

// ==========================================
// GitHub Client API Functions
// ==========================================

export async function fetchGitHubStatus(): Promise<GitHubStatusResponse> {
  try {
    const res = await fetch('/api/github/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (e) {
    return { connected: false, user: null, hasEnvToken: false };
  }
}

export async function connectGitHub(token: string): Promise<{ success: boolean; user?: GitHubUser; error?: string }> {
  try {
    const res = await fetch('/api/github/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل الاتصال بـ GitHub' };
  }
}

export async function disconnectGitHub(): Promise<boolean> {
  try {
    const res = await fetch('/api/github/disconnect', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch('/api/github/repos');
    const data = await res.json();
    return data.success && Array.isArray(data.repos) ? data.repos : [];
  } catch {
    return [];
  }
}

export async function createGitHubRepo(
  name: string,
  description: string,
  isPrivate: boolean
): Promise<{ success: boolean; repo?: GitHubRepo; error?: string }> {
  try {
    const res = await fetch('/api/github/create-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, isPrivate }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل إنشاء المستودع' };
  }
}

export async function pushProjectToGitHub(options: {
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
}): Promise<GitHubPushResult> {
  try {
    const res = await fetch('/api/github/push-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل رفع المشروع' };
  }
}

export async function pushDataToGitHub(options: {
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
}): Promise<GitHubPushResult> {
  try {
    const res = await fetch('/api/github/push-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل رفع البيانات والتقارير' };
  }
}

