import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Copy, 
  Check, 
  QrCode, 
  Wifi, 
  Cloud, 
  ArrowLeftRight,
  ShieldCheck 
} from 'lucide-react';

interface MobileDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedCount: number;
}

export const MobileDeviceSyncModal: React.FC<MobileDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  connectedCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Clean QR code generator via standard public safe QR API for easy mobile camera scan
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&margin=10`;

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-colors"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-50 to-white dark:from-teal-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                المزامنة اللحظية مع الهاتف والكمبيوتر
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الوصول لنفس البيانات وتعديلها من أي جهاز في الوقت الفعلي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          
          {/* Sync Illustration */}
          <div className="flex items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-2xs font-semibold">حاسوب</span>
            </div>

            <div className="flex flex-col items-center">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-3xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">مزامنة فورية</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-slate-700 dark:text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-2xs font-semibold">هاتف ذكي</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="p-2.5 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs inline-block">
              <img
                src={qrCodeUrl}
                alt="QR Code للمزامنة"
                className="w-40 h-40 object-contain rounded-lg"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              امسح رمز الاستجابة السريعة (QR) بكاميرا هاتفك لفتح التطبيق مباشرة
            </p>
          </div>

          {/* URL Copy Box */}
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              رابط التطبيق المباشر:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono focus:outline-hidden"
              />
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>

          {/* Features note */}
          <div className="text-right text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/70 space-y-1.5">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>مزايا المزامنة اللحظية:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-emerald-900/80 dark:text-emerald-200/80 text-2xs">
              <li>أي إضافة أو تعديل تجريه على الهاتف يظهر في الحال على الحاسوب دون تحديث الصفحة.</li>
              <li>البيانات مخزنة سحابياً ومحمية مع إمكانية التصدير إلى Excel و CSV بنقرة واحدة.</li>
              <li>واجهة مخصصة تلقائياً لشاشات الهواتف مع بطاقات سهلة اللمس.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
};
