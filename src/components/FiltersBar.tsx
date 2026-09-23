import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  LayoutList, 
  LayoutGrid, 
  RotateCcw,
  PlusCircle 
} from 'lucide-react';
import { MissionFilters } from '../types';

interface FiltersBarProps {
  filters: MissionFilters;
  onFilterChange: (filters: MissionFilters) => void;
  onResetFilters: () => void;
  viewMode: 'table' | 'cards';
  onToggleViewMode: (mode: 'table' | 'cards') => void;
  missionTypes: string[];
  totalFiltered: number;
  totalAll: number;
  onOpenAddModal?: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onToggleViewMode,
  missionTypes,
  totalFiltered,
  totalAll,
  onOpenAddModal,
}) => {
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.missionType ||
    filters.status
  );

  return (
    <div className="no-print bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-5 transition-colors">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="بحث بإسم المفتش، رقم التأجير، الوجهة، المرافق..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pr-10 pl-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & View Toggles & Add Button */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Mission Type Filter */}
          <div className="relative">
            <select
              value={filters.missionType}
              onChange={(e) => onFilterChange({ ...filters, missionType: e.target.value })}
              className="px-3 py-2 pr-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 transition-all cursor-pointer max-w-[170px] truncate"
            >
              <option value="">جميع أنواع المهام</option>
              {missionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="px-3 py-2 pr-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 transition-all cursor-pointer"
            >
              <option value="">جميع الحالات</option>
              <option value="completed">منجزة</option>
              <option value="in_progress">قيد الإنجاز</option>
              <option value="scheduled">مبرمجة</option>
            </select>
          </div>

          {/* Reset button if active filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
              title="إلغاء التصفية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          )}

          {/* View Mode Toggle (Table / Cards) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="عرض الجدول (مناسب للحاسوب)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="عرض البطاقات (مناسب للهاتف)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Add Mission Icon Button */}
          {onOpenAddModal && (
            <button
              id="filterbar-btn-add-mission"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-emerald-700/20 cursor-pointer mr-auto md:mr-0"
              title="أيقونة إضافة: إنشاء مهمة تفتيش جديدة"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>إضافة مهمة</span>
            </button>
          )}

        </div>

      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span>عرض {totalFiltered} من أصل {totalAll} مهمة مسجلة</span>
          {hasActiveFilters && <span className="text-emerald-700 dark:text-emerald-400 font-semibold mr-1.5">(مصفاة)</span>}
        </div>
        <div className="hidden sm:block">
          انقر فوق أي صف أو بطاقة للاطلاع على التفاصيل الكاملة
        </div>
      </div>
    </div>
  );
};
