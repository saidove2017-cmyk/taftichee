import React from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin, 
  TrendingUp 
} from 'lucide-react';
import { Mission } from '../types';

interface StatsCardsProps {
  missions: Mission[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ missions }) => {
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const inProgressMissions = missions.filter(m => m.status === 'in_progress').length;
  const scheduledMissions = missions.filter(m => m.status === 'scheduled').length;

  const uniqueInspectors = new Set(missions.map(m => m.inspectorName.trim()).filter(Boolean)).size;

  // Calculate top destination
  const destCounts: Record<string, number> = {};
  missions.forEach(m => {
    [m.destination1, m.destination2, m.destination3].forEach(d => {
      if (d && d.trim()) {
        const trimmed = d.trim();
        destCounts[trimmed] = (destCounts[trimmed] || 0) + 1;
      }
    });
  });

  const topDestination = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return (
    <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Card 1: Total */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي مهام التفتيش</span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalMissions}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">مهمة مسجلة</span>
        </div>
      </div>

      {/* Card 2: Completed */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مهام منجزة</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedMissions}</span>
          <span className="text-xs text-emerald-700/70 dark:text-emerald-400/80 font-medium">
            {totalMissions > 0 ? `${Math.round((completedMissions / totalMissions) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Card 3: In Progress & Scheduled */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">قيد الإنجاز / مبرمجة</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {inProgressMissions + scheduledMissions}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            ({inProgressMissions} جارية, {scheduledMissions} مبرمجة)
          </span>
        </div>
      </div>

      {/* Card 4: Unique Inspectors & Top Destination */}
      <div className="bg-[#f5f5f5] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">السادة المفتشون</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{uniqueInspectors}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">مفتش نشط</span>
        </div>
        <div className="mt-1 text-2xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
          <span className="truncate">الأكثر زيارة: {topDestination}</span>
        </div>
      </div>

    </div>
  );
};
