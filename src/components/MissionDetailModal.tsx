import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  MapPin, 
  Users, 
  Briefcase, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Mission } from '../types';

interface MissionDetailModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MissionDetailModal: React.FC<MissionDetailModalProps> = ({
  mission,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !mission) return null;

  const handlePrint = () => {
    window.print();
  };

  const destinations = [mission.destination1, mission.destination2, mission.destination3].filter(Boolean);
  const companions = [mission.companion1, mission.companion2, mission.companion3].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        role="dialog"
      >
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">بيان وأمر بمهمة تفتيش</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الأمر بمهمة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:bg-white print:text-black space-y-6">
          
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 print:border-black pb-5 space-y-1">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-slate-700">المملكة المغربية • وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">المفتشية العامة للشؤون التربوية والإدارية</div>
            <div className="text-lg font-black text-slate-900 dark:text-white print:text-black pt-2 tracking-wide uppercase">
              أَمْــرٌ بِـمُـهِـمَّــةِ تَـفْـتِـيـشٍ وَمُـرَاقَـبَــة
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              المرجع: {mission.id.toUpperCase()} • بتاريخ: {mission.missionDate}
            </div>
          </div>

          {/* Inspector Information Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 print:bg-slate-50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 print:border-slate-300">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">إسم السيد المفتش:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white print:text-black">{mission.inspectorName}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">رقم التأجير (PPR):</span>
              <span className="text-base font-mono font-bold text-slate-900 dark:text-white print:text-black">{mission.rentalNumber}</span>
            </div>
          </div>

          {/* Mission Details */}
          <div className="space-y-4 text-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نوع وطبيعة المهمة:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 print:text-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 print:bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 print:border-emerald-300">
                {mission.missionType}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">تاريخ إنجاز المهمة:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 print:text-black">{mission.missionDate}</span>
            </div>

            {/* Destinations */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 print:border-slate-200">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">الاتجاهات والوجهات المحددة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 mb-0.5">الاتجاه (1) - الرئيسي</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 print:text-black text-xs">{mission.destination1}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">الاتجاه (2)</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black text-xs">{mission.destination2 || '—'}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">الاتجاه (3)</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black text-xs">{mission.destination3 || '—'}</div>
                </div>
              </div>
            </div>

            {/* Companions */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 print:border-slate-200">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">السادة المرافقون في المهمة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-blue-700 dark:text-blue-400 print:text-blue-800 mb-0.5">المرافق (1)</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 print:text-black text-xs">{mission.companion1 || 'بدون مرافق'}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">المرافق (2)</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black text-xs">{mission.companion2 || '—'}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 print:bg-slate-50">
                  <div className="text-3xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">المرافق (3)</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black text-xs">{mission.companion3 || '—'}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {mission.notes && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/40 print:bg-amber-50 border border-amber-200/80 dark:border-amber-800/80 print:border-amber-300 rounded-xl text-xs text-amber-900 dark:text-amber-300 print:text-black">
                <span className="font-bold block mb-1">ملاحظات وتوجيهات خاصة:</span>
                <p>{mission.notes}</p>
              </div>
            )}

          </div>

          {/* Stamp & Signature Section */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-700 dark:text-slate-300 print:text-black">
            <div>
              <span className="font-bold block mb-12">توقيع السيد المفتش</span>
              <div className="border-t border-slate-300 dark:border-slate-700 print:border-slate-400 w-32 mx-auto pt-1 font-mono text-slate-400 dark:text-slate-500 print:text-slate-600">
                {mission.inspectorName}
              </div>
            </div>
            <div>
              <span className="font-bold block mb-12">خاتم وتأشيرة المصلحة المختصة</span>
              <div className="border-t border-slate-300 dark:border-slate-700 print:border-slate-400 w-32 mx-auto pt-1 font-mono text-slate-400 dark:text-slate-500 print:text-slate-600">
                التأشيرة الرسمية
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
