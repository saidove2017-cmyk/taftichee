import React from 'react';
import { 
  PlusCircle, 
  Save, 
  Download, 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  Smartphone, 
  FileSpreadsheet,
  FileText,
  Printer,
  Shield,
  Sun,
  Moon,
  Github
} from 'lucide-react';
import { SyncState } from '../types';

interface HeaderProps {
  onOpenAddModal: () => void;
  onManualSave: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onPrintAll: () => void;
  onOpenDeviceSync: () => void;
  onOpenGitHub?: () => void;
  isGitHubConnected?: boolean;
  syncState: SyncState;
  isSaving: boolean;
  totalMissions: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onManualSave,
  onExportExcel,
  onExportCSV,
  onExportJSON,
  onPrintAll,
  onOpenDeviceSync,
  onOpenGitHub,
  isGitHubConnected = false,
  syncState,
  isSaving,
  totalMissions,
  theme,
  onToggleTheme,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Right side: Branding and Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                نظام تدبير مهام التفتيش
              </h1>
            </div>
          </div>

          {/* Left side: Controls and Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Dark Mode Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700"
              title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Cloud Real-time Status Badge */}
            <div 
              title="حالة المزامنة السحابية اللحظية بين الأجهزة"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {syncState === 'connected' && (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">مزامنة سحابية نشطة</span>
                </>
              )}
              {syncState === 'syncing' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">جاري المزامنة...</span>
                </>
              )}
              {syncState === 'offline' && (
                <>
                  <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-amber-800 dark:text-amber-300">وضع العمل المحلي</span>
                </>
              )}
              {syncState === 'error' && (
                <>
                  <CloudOff className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="font-medium text-rose-800 dark:text-rose-300">إعادة الاتصال بالسحابة...</span>
                </>
              )}
            </div>

            {/* Smartphone Connect Button */}
            <button
              id="btn-mobile-sync"
              onClick={onOpenDeviceSync}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
              title="فتح التطبيق على الهاتف للمزامنة الفورية"
            >
              <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">الهاتف</span>
            </button>

            {/* GitHub Connect & Upload Button */}
            {onOpenGitHub && (
              <button
                id="btn-github-integration"
                onClick={onOpenGitHub}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer relative"
                title="الاتصال بـ GitHub لرفع ملفات المشروع والبيانات"
              >
                <Github className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                <span className="hidden sm:inline">GitHub</span>
                {isGitHubConnected && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                    title="متصل بحساب GitHub"
                  />
                )}
              </button>
            )}

            {/* Export Dropdown Menu */}
            <div className="relative">
              <button
                id="btn-export-dropdown"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 shadow-2xs"
                title="تصدير البيانات بصيغ متعددة"
              >
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">تصدير</span>
              </button>

              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportMenu(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                      خيارات تصدير البيانات ({totalMissions} مهمة)
                    </div>
                    <button
                      id="export-excel-btn"
                      onClick={() => {
                        setShowExportMenu(false);
                        onExportExcel();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-medium">تصدير إلى إكسيل (Excel .xlsx)</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">جدول منسق باللغة العربية</div>
                      </div>
                    </button>
                    <button
                      id="export-csv-btn"
                      onClick={() => {
                        setShowExportMenu(false);
                        onExportCSV();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                    >
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <div>
                        <div className="font-medium">تصدير بصيغة CSV (UTF-8)</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">متوافق مع كل برامج الجداول</div>
                      </div>
                    </button>
                    <button
                      id="print-report-btn"
                      onClick={() => {
                        setShowExportMenu(false);
                        onPrintAll();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                    >
                      <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-medium">طباعة / حفظ PDF</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">تقرير جدول المهام للطباعة</div>
                      </div>
                    </button>
                    <button
                      id="export-json-btn"
                      onClick={() => {
                        setShowExportMenu(false);
                        onExportJSON();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <Save className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <div className="font-medium">نسخة احتياطية (JSON)</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">حفظ كامل للبيانات</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Requested "أيقونة حفظ" - Save & Sync Icon Button */}
            <button
              id="btn-save-sync"
              onClick={onManualSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 active:scale-95 transition-all shadow-xs disabled:opacity-50 border border-slate-700 dark:border-slate-600 cursor-pointer shrink-0"
              title="أيقونة حفظ: حفظ ومزامنة البيانات سحابياً فوراً"
            >
              {isSaving ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-red-500" />
              ) : (
                <Save className="w-4.5 h-4.5 text-red-500" />
              )}
              <span>حفظ ومزامنة</span>
            </button>

            {/* Requested "أيقونة إضافة" - Add Mission Icon Button */}
            <button
              id="btn-add-mission"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
              title="أيقونة إضافة: إضافة مهمة تفتيش جديدة"
            >
              <PlusCircle className="w-4.5 h-4.5 text-white" />
              <span>إضافة مهمة</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
