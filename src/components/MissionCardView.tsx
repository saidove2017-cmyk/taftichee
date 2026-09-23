import React from 'react';
import { 
  User, 
  Hash, 
  Calendar, 
  MapPin, 
  Users, 
  Briefcase, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText,
  PlusCircle 
} from 'lucide-react';
import { Mission } from '../types';

interface MissionCardViewProps {
  missions: Mission[];
  onEdit: (mission: Mission) => void;
  onDelete: (id: string) => void;
  onViewDetails: (mission: Mission) => void;
  onOpenAddModal?: () => void;
}

export const MissionCardView: React.FC<MissionCardViewProps> = ({
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            منجزة
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            قيد الإنجاز
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Calendar className="w-3 h-3" />
            مبرمجة
          </span>
        );
    }
  };

  if (missions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">لا توجد مهام مطابقة</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-3">
          يمكنك النقر على الزر أدناه لإضافة مهمة تفتيش ومراقبة جديدة
        </p>
        {onOpenAddModal && (
          <button
            id="empty-cards-btn-add-mission"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>إضافة مهمة جديدة</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {missions.map((mission) => {
        const destinations = [mission.destination1, mission.destination2, mission.destination3].filter(Boolean);
        const companions = [mission.companion1, mission.companion2, mission.companion3].filter(Boolean);

        return (
          <div
            key={mission.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Top Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-l from-slate-50/70 to-white dark:from-slate-800/40 dark:to-slate-900">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{mission.inspectorName}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-2xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      PPR: {mission.rentalNumber}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {mission.missionDate}
                    </span>
                  </div>
                </div>

                <div>
                  {getStatusBadge(mission.status)}
                </div>
              </div>

              {/* Mission Type */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-100/80 dark:border-emerald-800">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{mission.missionType}</span>
              </div>
            </div>

            {/* Content: Destinations & Companions */}
            <div className="p-4 space-y-3 text-xs flex-1">
              
              {/* Destinations */}
              <div>
                <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  الاتجاهات المستهدفة:
                </span>
                <div className="flex flex-col gap-1">
                  {destinations.map((dest, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-3xs flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{dest}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Companions */}
              <div>
                <span className="text-2xs font-bold text-slate-400 dark:text-slate-500 block mb-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  المرافقون:
                </span>
                {companions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {companions.map((comp, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        <span className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-3xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {comp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xs text-slate-400 dark:text-slate-500 italic">بدون مرافقين</span>
                )}
              </div>

              {/* Notes */}
              {mission.notes && (
                <p className="text-2xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic line-clamp-2">
                  {mission.notes}
                </p>
              )}

            </div>

            {/* Footer Actions */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                onClick={() => onViewDetails(mission)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>عرض وطباعة</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(mission)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(mission.id)}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};
