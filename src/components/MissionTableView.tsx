import React from 'react';
import { 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle 
} from 'lucide-react';
import { Mission } from '../types';

interface MissionTableViewProps {
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDelete: (id: string) => void;
  onViewDetails: (mission: Mission) => void;
  onOpenAddModal?: () => void;
}

export const MissionTableView: React.FC<MissionTableViewProps> = ({
  missions,
  onEdit,
  onDelete,
  onViewDetails,
  onOpenAddModal,
}) => {
  const getStatusBadge = (status: Mission['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            منجزة
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            قيد الإنجاز
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Calendar className="w-3 h-3" />
            مبرمجة
          </span>
        );
    }
  };

  if (missions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">لا توجد مهام تفتيش مطابقة</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          لم يتم العثور على مهام وفق معايير البحث الحالية، أو يمكنك النقر على أيقونة "إضافة مهمة" لإنشاء مهمة جديدة فوراً.
        </p>
        {onOpenAddModal && (
          <button
            id="empty-table-btn-add-mission"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5 text-white" />
            <span>إضافة مهمة تفتيش جديدة</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs">
              <th className="py-3.5 px-4">#</th>
              <th className="py-3.5 px-4 min-w-[160px]">إسم السيد المفتش</th>
              <th className="py-3.5 px-4 min-w-[100px]">رقم التأجير</th>
              <th className="py-3.5 px-4 min-w-[160px]">نوع المهمة</th>
              <th className="py-3.5 px-4 min-w-[110px]">التاريخ</th>
              <th className="py-3.5 px-4 min-w-[200px]">الاتجاهات (1 / 2 / 3)</th>
              <th className="py-3.5 px-4 min-w-[200px]">المرافقون (1 / 2 / 3)</th>
              <th className="py-3.5 px-4 min-w-[100px]">الحالة</th>
              <th className="py-3.5 px-4 text-center min-w-[120px]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {missions.map((mission, index) => {
              const destinations = [mission.destination1, mission.destination2, mission.destination3].filter(Boolean);
              const companions = [mission.companion1, mission.companion2, mission.companion3].filter(Boolean);

              return (
                <tr 
                  key={mission.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-3 px-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </td>
                  
                  {/* Field 1: إسم السيد المفتش */}
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                        {mission.inspectorName.replace(/^(ذ\.|ذة\.|السيد|السيدة)\s*/, '').charAt(0) || 'م'}
                      </div>
                      <span>{mission.inspectorName}</span>
                    </div>
                  </td>

                  {/* Field 2: رقم التأجير */}
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {mission.rentalNumber}
                    </span>
                  </td>

                  {/* Field 3: نوع المهمة */}
                  <td className="py-3 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {mission.missionType}
                  </td>

                  {/* Field 4: التاريخ */}
                  <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {mission.missionDate}
                  </td>

                  {/* Fields 5, 6, 7: الاتجاهات */}
                  <td className="py-3 px-4 text-xs">
                    <div className="flex flex-col gap-1">
                      {destinations.map((dest, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-3xs flex items-center justify-center font-bold shrink-0">
                            {i + 1}
                          </span>
                          <span className="truncate max-w-[180px]" title={dest}>{dest}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Fields 8, 9, 10: المرافقون */}
                  <td className="py-3 px-4 text-xs">
                    {companions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {companions.map((comp, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-3xs flex items-center justify-center font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="truncate max-w-[180px]" title={comp}>{comp}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic">بدون مرافق</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(mission.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewDetails(mission)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="عرض تفاصيل المهمة والأمر بمهمة للطباعة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(mission)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        title="تعديل بيانات المهمة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(mission.id)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
