/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Save, 
  Download, 
  Smartphone, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileSpreadsheet,
  SlidersHorizontal,
  CloudCheck
} from 'lucide-react';
import { Mission, MissionFormData, MissionFilters, SyncState } from './types';
import { 
  fetchMissions, 
  createMission, 
  updateMission, 
  deleteMission, 
  bulkSyncMissions, 
  subscribeToRealtimeSync,
  getLocalCachedMissions 
} from './lib/api';
import { 
  exportToExcel, 
  exportToCSV, 
  exportToJSON 
} from './lib/exportUtils';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FiltersBar } from './components/FiltersBar';
import { MissionTableView } from './components/MissionTableView';
import { MissionCardView } from './components/MissionCardView';
import { MissionFormModal } from './components/MissionFormModal';
import { MissionDetailModal } from './components/MissionDetailModal';
import { MobileDeviceSyncModal } from './components/MobileDeviceSyncModal';
import { GitHubModal } from './components/GitHubModal';
import { fetchGitHubStatus } from './lib/api';

export default function App() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('connected');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // GitHub integration state
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);

  // Dark / Light Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_preference');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme_preference', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [viewingMission, setViewingMission] = useState<Mission | null>(null);
  const [isDeviceSyncOpen, setIsDeviceSyncOpen] = useState(false);

  // View settings: default to table on desktop, cards on small mobile
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });

  // Filters state
  const [filters, setFilters] = useState<MissionFilters>({
    searchQuery: '',
    missionType: '',
    inspectorName: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Initial load
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchMissions();
        if (mounted) {
          setMissions(data);
          setSyncState('connected');
        }
      } catch (err) {
        console.error('Initial load failed:', err);
        if (mounted) setSyncState('offline');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    // Check GitHub connection
    fetchGitHubStatus().then((st) => {
      if (mounted) setIsGitHubConnected(st.connected);
    }).catch(() => {});

    // Subscribe to real-time server updates (cross-device sync)
    const unsubscribe = subscribeToRealtimeSync((event) => {
      if (!mounted) return;

      if (event.action === 'create') {
        const newM: Mission = event.payload;
        setMissions(prev => [newM, ...prev.filter(m => m.id !== newM.id)]);
        showToast(`تمت إضافة مهمة جديدة للمفتش ${newM.inspectorName} سحابياً`, 'info');
      } else if (event.action === 'update') {
        const updatedM: Mission = event.payload;
        setMissions(prev => prev.map(m => m.id === updatedM.id ? updatedM : m));
        showToast(`تم تحديث مهمة للمفتش ${updatedM.inspectorName} سحابياً`, 'info');
      } else if (event.action === 'delete') {
        const { id } = event.payload;
        setMissions(prev => prev.filter(m => m.id !== id));
        showToast('تم حذف مهمة من السحابة', 'info');
      } else if (event.action === 'bulk') {
        setMissions(event.payload);
        showToast('تمت مزامنة جميع المهام سحابياً', 'info');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Filtered missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      // Search query matches inspector name, rentalNumber, missionType, destinations, companions, or notes
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const searchPool = [
          m.inspectorName,
          m.rentalNumber,
          m.missionType,
          m.destination1,
          m.destination2,
          m.destination3,
          m.companion1,
          m.companion2,
          m.companion3,
          m.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchPool.includes(q)) return false;
      }

      // Mission Type filter
      if (filters.missionType && m.missionType !== filters.missionType) {
        return false;
      }

      // Status filter
      if (filters.status && m.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [missions, filters]);

  // Unique lists for filters
  const uniqueMissionTypes = useMemo(() => {
    const set = new Set(missions.map(m => m.missionType).filter(Boolean));
    return Array.from(set);
  }, [missions]);

  // Handlers
  const handleSaveMission = async (formData: MissionFormData, missionId?: string) => {
    setIsSaving(true);
    try {
      if (missionId) {
        const updated = await updateMission(missionId, formData);
        setMissions(prev => prev.map(m => m.id === missionId ? updated : m));
        showToast('تم حفظ التعديلات ومزامنتها بنجاح!', 'success');
      } else {
        const created = await createMission(formData);
        setMissions(prev => [created, ...prev.filter(m => m.id !== created.id)]);
        showToast('تم حفظ المهمة الجديدة ومزامنتها سحابياً!', 'success');
      }
    } catch (err) {
      console.error('Error saving mission:', err);
      showToast('حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMission = async (id: string) => {
    const mission = missions.find(m => m.id === id);
    const name = mission ? mission.inspectorName : '';
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف مهمة التفتيش الخاصة بـ "${name}"؟`)) {
      const ok = await deleteMission(id);
      if (ok) {
        setMissions(prev => prev.filter(m => m.id !== id));
        showToast('تم حذف المهمة بنجاح ومزامنة التغيير', 'success');
      } else {
        showToast('فشل حذف المهمة', 'error');
      }
    }
  };

  const handleManualSaveAndSync = async () => {
    setIsSaving(true);
    setSyncState('syncing');
    try {
      await bulkSyncMissions(missions, 'merge');
      setSyncState('connected');
      showToast('تم حفظ كافة البيانات ومزامنتها سحابياً بنجاح!', 'success');
    } catch (err) {
      setSyncState('error');
      showToast('تعذر المزامنة الكاملة، تم حفظ البيانات محلياً', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (filteredMissions.length === 0) {
      showToast('لا توجد بيانات لتصديرها', 'error');
      return;
    }
    exportToExcel(filteredMissions, `مهام_التفتيش_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('تم تصدير ملف Excel بنجاح!', 'success');
  };

  const handleExportCSV = () => {
    if (filteredMissions.length === 0) {
      showToast('لا توجد بيانات لتصديرها', 'error');
      return;
    }
    exportToCSV(filteredMissions, `مهام_التفتيش_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('تم تصدير ملف CSV مع دعم اللغة العربية بنجاح!', 'success');
  };

  const handleExportJSON = () => {
    if (missions.length === 0) {
      showToast('لا توجد بيانات لتصديرها', 'error');
      return;
    }
    exportToJSON(missions, `نسخة_احتياطية_مهام_${new Date().toISOString().split('T')[0]}.json`);
    showToast('تم تنزيل النسخة الاحتياطية بنجاح!', 'success');
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#efa410] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      
      {/* App Header */}
      <Header
        onOpenAddModal={() => {
          setEditingMission(null);
          setIsAddModalOpen(true);
        }}
        onManualSave={handleManualSaveAndSync}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onPrintAll={handlePrintAll}
        onOpenDeviceSync={() => setIsDeviceSyncOpen(true)}
        onOpenGitHub={() => setIsGitHubModalOpen(true)}
        isGitHubConnected={isGitHubConnected}
        syncState={syncState}
        isSaving={isSaving}
        totalMissions={missions.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Statistics KPIs Overview */}
        <StatsCards missions={missions} />

        {/* Search & Filter Bar */}
        <FiltersBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters({
            searchQuery: '',
            missionType: '',
            inspectorName: '',
            startDate: '',
            endDate: '',
            status: '',
          })}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          missionTypes={uniqueMissionTypes}
          totalFiltered={filteredMissions.length}
          totalAll={missions.length}
          onOpenAddModal={() => {
            setEditingMission(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* Data List (Table or Cards view) */}
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">جاري تحميل مهام التفتيش والمزامنة السحابية...</p>
          </div>
        ) : viewMode === 'table' ? (
          <MissionTableView
            missions={filteredMissions}
            onEdit={(m) => {
              setEditingMission(m);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteMission}
            onViewDetails={(m) => setViewingMission(m)}
            onOpenAddModal={() => {
              setEditingMission(null);
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <MissionCardView
            missions={filteredMissions}
            onEdit={(m) => {
              setEditingMission(m);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteMission}
            onViewDetails={(m) => setViewingMission(m)}
            onOpenAddModal={() => {
              setEditingMission(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Persistent Floating Add Mission Button for Desktop & Tablet */}
      <div className="no-print hidden sm:flex fixed bottom-6 left-6 z-40">
        <button
          id="desktop-fab-add-mission"
          onClick={() => {
            setEditingMission(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#f20808] hover:bg-red-700 text-white font-bold text-sm shadow-xl shadow-red-700/30 active:scale-95 transition-all hover:scale-105 cursor-pointer border-2 border-white/20"
          title="أيقونة إضافة: إنشاء مهمة تفتيش جديدة"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>إضافة مهمة تفتيش</span>
        </button>
      </div>

      {/* Floating Action Buttons for Mobile Users (Prominent Add & Save Icons) */}
      <div className="no-print sm:hidden fixed bottom-5 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        
        {/* Mobile Save & Sync Button */}
        <button
          onClick={handleManualSaveAndSync}
          disabled={isSaving}
          className="pointer-events-auto flex items-center gap-1.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-slate-850 text-white font-bold text-xs shadow-xl active:scale-95 transition-all border border-slate-700 dark:border-slate-700 cursor-pointer"
          title="أيقونة حفظ البيانات"
        >
          {isSaving ? (
            <RefreshCw className="w-4.5 h-4.5 animate-spin text-red-500" />
          ) : (
            <Save className="w-4.5 h-4.5 text-red-500" />
          )}
          <span>حفظ ومزامنة</span>
        </button>

        {/* Mobile Add Mission Button */}
        <button
          id="mobile-fab-add-mission"
          onClick={() => {
            setEditingMission(null);
            setIsAddModalOpen(true);
          }}
          className="pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-700/30 active:scale-95 transition-all cursor-pointer"
          title="أيقونة إضافة مهمة جديدة"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>إضافة مهمة</span>
        </button>

      </div>

      {/* Mission Add/Edit Modal */}
      <MissionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMission(null);
        }}
        onSave={handleSaveMission}
        editMission={editingMission}
      />

      {/* Mission Detail & Printable View Modal */}
      <MissionDetailModal
        isOpen={Boolean(viewingMission)}
        onClose={() => setViewingMission(null)}
        mission={viewingMission}
      />

      {/* Mobile QR & Sync Modal */}
      <MobileDeviceSyncModal
        isOpen={isDeviceSyncOpen}
        onClose={() => setIsDeviceSyncOpen(false)}
        connectedCount={1}
      />

      {/* GitHub Integration & Upload Modal */}
      <GitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onConnectionChange={setIsGitHubConnected}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-800 text-white border-emerald-700'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-300" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" />
            )}
            <span>{toastMessage.text}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="mr-2 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
