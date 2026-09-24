import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Hash, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Users, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Mission, MissionFormData } from '../types';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: MissionFormData, missionId?: string) => Promise<void>;
  editMission: Mission | null;
  existingInspectors?: string[];
  existingDestinations?: string[];
}

const COMMON_MISSION_TYPES = [
  'زيارة تفتيشية وتأطيرية',
  'مراقبة مستمرة وتتبع بيداغوجي',
  'بحث إداري ومعاينة ميدانية',
  'تدبير مالي ومادي وتفقد مرافق',
  'تأطير وتقويم هيئة التدريس',
  'افتحاص تدبير مؤسسة تعليمية',
  'مواكبة الدخول المدرسي / الامتحانات',
];

export const MissionFormModal: React.FC<MissionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMission,
  existingInspectors = [],
  existingDestinations = [],
}) => {
  const [formData, setFormData] = useState<MissionFormData>({
    inspectorName: '',
    rentalNumber: '',
    missionType: COMMON_MISSION_TYPES[0],
    missionDate: new Date().toISOString().split('T')[0],
    destination1: '',
    destination2: '',
    destination3: '',
    companion1: '',
    companion2: '',
    companion3: '',
    notes: '',
    status: 'scheduled',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMission) {
      setFormData({
        inspectorName: editMission.inspectorName,
        rentalNumber: editMission.rentalNumber,
        missionType: editMission.missionType,
        missionDate: editMission.missionDate,
        destination1: editMission.destination1,
        destination2: editMission.destination2 || '',
        destination3: editMission.destination3 || '',
        companion1: editMission.companion1 || '',
        companion2: editMission.companion2 || '',
        companion3: editMission.companion3 || '',
        notes: editMission.notes || '',
        status: editMission.status,
      });
      setErrors({});
    } else {
      setFormData({
        inspectorName: '',
        rentalNumber: '',
        missionType: COMMON_MISSION_TYPES[0],
        missionDate: new Date().toISOString().split('T')[0],
        destination1: '',
        destination2: '',
        destination3: '',
        companion1: '',
        companion2: '',
        companion3: '',
        notes: '',
        status: 'scheduled',
      });
      setErrors({});
    }
  }, [editMission, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.inspectorName.trim()) {
      errs.inspectorName = 'يرجى إدخال إسم السيد المفتش';
    }
    if (!formData.rentalNumber.trim()) {
      errs.rentalNumber = 'يرجى إدخال رقم التأجير';
    }
    if (!formData.missionType.trim()) {
      errs.missionType = 'يرجى تحديد نوع المهمة';
    }
    if (!formData.missionDate) {
      errs.missionDate = 'يرجى تحديد التاريخ';
    }
    if (!formData.destination1.trim()) {
      errs.destination1 = 'يرجى إدخال الاتجاه (1) على الأقل';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData, editMission?.id);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTodayDate = () => {
    setFormData(prev => ({
      ...prev,
      missionDate: new Date().toISOString().split('T')[0],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ef0d0d] text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editMission ? 'تعديل مهمة تفتيش' : 'إضافة مهمة تفتيش جديدة'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل كافة بيانات المهمة مع إمكانية تحديد حتى 3 وجهات و3 مرافقين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 bg-[#fcfcfc] rounded-sm" style={{ backgroundColor: '#fcfcfc' }} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form id="mission-form" onSubmit={handleSubmit} style={{ backgroundColor: '#81e0de' }} className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-[#81e0de]">
          
          {/* Section 1: Inspector & Rental Number */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>معلومات السيد المفتش</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: إسم السيد المفتش */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  إسم السيد المفتش <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: ذ. عبد العزيز الفاسي"
                    value={formData.inspectorName}
                    onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                      errors.inspectorName
                        ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                    }`}
                  />
                </div>
                {errors.inspectorName && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.inspectorName}
                  </p>
                )}
              </div>

              {/* Field 2: رقم التأجير */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رقم التأجير (PPR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1048293"
                    value={formData.rentalNumber}
                    onChange={(e) => setFormData({ ...formData, rentalNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all font-mono ${
                      errors.rentalNumber
                        ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/20'
                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                    }`}
                  />
                </div>
                {errors.rentalNumber && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.rentalNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Mission Type & Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>طبيعة وتاريخ المهمة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 3: نوع المهمة */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نوع المهمة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="mission-types-list"
                  placeholder="حدد أو اكتب نوع المهمة"
                  value={formData.missionType}
                  onChange={(e) => setFormData({ ...formData, missionType: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.missionType
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                  }`}
                />
                <datalist id="mission-types-list">
                  {COMMON_MISSION_TYPES.map(t => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                
                {/* Quick suggestions chips */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {COMMON_MISSION_TYPES.slice(0, 3).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, missionType: type })}
                      className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: التاريخ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    التاريخ <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={setTodayDate}
                    className="text-2xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
                  >
                    اليوم
                  </button>
                </div>
                <input
                  type="date"
                  required
                  value={formData.missionDate}
                  onChange={(e) => setFormData({ ...formData, missionDate: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.missionDate
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                  }`}
                />
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                حالة المهمة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'scheduled', label: 'مبرمجة', color: 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40' },
                  { id: 'in_progress', label: 'قيد الإنجاز', color: 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40' },
                  { id: 'completed', label: 'منجزة', color: 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      formData.status === item.id
                        ? `${item.color} font-bold ring-2 ring-emerald-500/20 border-emerald-500 dark:border-emerald-500`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={item.id}
                      checked={formData.status === item.id}
                      onChange={() => setFormData({ ...formData, status: item.id as any })}
                      className="sr-only"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: The 3 Destinations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>الاتجاهات / الوجهات (حتى 3 وجهات)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Field 5: الاتجاه (1) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الاتجاه (1) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ثانوية ابن رشد"
                  value={formData.destination1}
                  onChange={(e) => setFormData({ ...formData, destination1: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.destination1
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                  }`}
                />
                {errors.destination1 && (
                  <p className="text-rose-600 dark:text-rose-400 text-2xs mt-1">{errors.destination1}</p>
                )}
              </div>

              {/* Field 6: الاتجاه (2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الاتجاه (2) <span className="text-slate-400 dark:text-slate-500 text-2xs">(اختياري)</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: إعدادية الفارابي"
                  value={formData.destination2}
                  onChange={(e) => setFormData({ ...formData, destination2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all"
                />
              </div>

              {/* Field 7: الاتجاه (3) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الاتجاه (3) <span className="text-slate-400 dark:text-slate-500 text-2xs">(اختياري)</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: ملحقة القدس"
                  value={formData.destination3}
                  onChange={(e) => setFormData({ ...formData, destination3: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 4: The 3 Companions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>المرافقون (حتى 3 مرافقين)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Field 8: إسم المرافق (1) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  إسم المرافق (1)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ذ. مصطفى البقالي"
                  value={formData.companion1}
                  onChange={(e) => setFormData({ ...formData, companion1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all"
                />
              </div>

              {/* Field 9: إسم المرافق (2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  إسم المرافق (2)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ذة. فاطمة المنصوري"
                  value={formData.companion2}
                  onChange={(e) => setFormData({ ...formData, companion2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all"
                />
              </div>

              {/* Field 10: إسم المرافق (3) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  إسم المرافق (3)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ذ. كريم التازي"
                  value={formData.companion3}
                  onChange={(e) => setFormData({ ...formData, companion3: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات إضافية / تفاصيل المهمة
            </label>
            <textarea
              rows={2}
              placeholder="أي ملاحظات إضافية أو مخرجات الزيارة..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all resize-none"
            />
          </div>

        </form>

        {/* Modal Footer with explicit "أيقونة حفظ" Save Button */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: '#f13b3b' }}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#f13b3b] hover:bg-red-600 rounded-xl transition-colors"
          >
            إلغاء
          </button>

          {/* Requested "أيقونة حفظ" Save Button */}
          <button
            type="submit"
            form="mission-form"
            id="modal-save-button"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{isSubmitting ? 'جاري الحفظ والمزامنة...' : 'حفظ البيانات ومزامنتها سحابياً'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
