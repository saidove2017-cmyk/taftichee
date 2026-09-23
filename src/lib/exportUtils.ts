import * as XLSX from 'xlsx';
import { Mission } from '../types';

export const FIELD_LABELS: Record<keyof Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>, string> = {
  inspectorName: 'إسم السيد المفتش',
  rentalNumber: 'رقم التأجير',
  missionType: 'نوع المهمة',
  missionDate: 'التاريخ',
  destination1: 'الاتجاه (1)',
  destination2: 'الاتجاه (2)',
  destination3: 'الاتجاه (3)',
  companion1: 'إسم المرافق (1)',
  companion2: 'إسم المرافق (2)',
  companion3: 'إسم المرافق (3)',
  notes: 'ملاحظات إضافية',
  status: 'حالة المهمة',
};

export function getStatusLabel(status: Mission['status']): string {
  switch (status) {
    case 'completed':
      return 'منجزة';
    case 'in_progress':
      return 'قيد الإنجاز';
    case 'scheduled':
      return 'مبرمجة';
    default:
      return status;
  }
}

export function formatMissionsForExport(missions: Mission[]) {
  return missions.map((m, index) => ({
    'الرقم الترتيبي': index + 1,
    'إسم السيد المفتش': m.inspectorName || '',
    'رقم التأجير': m.rentalNumber || '',
    'نوع المهمة': m.missionType || '',
    'التاريخ': m.missionDate || '',
    'الاتجاه (1)': m.destination1 || '',
    'الاتجاه (2)': m.destination2 || '',
    'الاتجاه (3)': m.destination3 || '',
    'إسم المرافق (1)': m.companion1 || '',
    'إسم المرافق (2)': m.companion2 || '',
    'إسم المرافق (3)': m.companion3 || '',
    'حالة المهمة': getStatusLabel(m.status),
    'ملاحظات': m.notes || '',
  }));
}

export function exportToExcel(missions: Mission[], filename = 'مهام_التفتيش.xlsx') {
  const data = formatMissionsForExport(missions);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set RTL direction on worksheet
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ RTL: true });

  // Column widths
  worksheet['!cols'] = [
    { wch: 12 }, // الرقم الترتيبي
    { wch: 24 }, // إسم السيد المفتش
    { wch: 14 }, // رقم التأجير
    { wch: 24 }, // نوع المهمة
    { wch: 14 }, // التاريخ
    { wch: 22 }, // الاتجاه (1)
    { wch: 22 }, // الاتجاه (2)
    { wch: 22 }, // الاتجاه (3)
    { wch: 22 }, // المرافق (1)
    { wch: 22 }, // المرافق (2)
    { wch: 22 }, // المرافق (3)
    { wch: 14 }, // حالة المهمة
    { wch: 30 }, // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مهام التفتيش');
  XLSX.writeFile(workbook, filename);
}

export function exportToCSV(missions: Mission[], filename = 'مهام_التفتيش.csv') {
  const headers = [
    'الرقم الترتيبي',
    'إسم السيد المفتش',
    'رقم التأجير',
    'نوع المهمة',
    'التاريخ',
    'الاتجاه (1)',
    'الاتجاه (2)',
    'الاتجاه (3)',
    'إسم المرافق (1)',
    'إسم المرافق (2)',
    'إسم المرافق (3)',
    'حالة المهمة',
    'ملاحظات',
  ];

  const rows = missions.map((m, idx) => [
    idx + 1,
    `"${(m.inspectorName || '').replace(/"/g, '""')}"`,
    `"${(m.rentalNumber || '').replace(/"/g, '""')}"`,
    `"${(m.missionType || '').replace(/"/g, '""')}"`,
    `"${(m.missionDate || '').replace(/"/g, '""')}"`,
    `"${(m.destination1 || '').replace(/"/g, '""')}"`,
    `"${(m.destination2 || '').replace(/"/g, '""')}"`,
    `"${(m.destination3 || '').replace(/"/g, '""')}"`,
    `"${(m.companion1 || '').replace(/"/g, '""')}"`,
    `"${(m.companion2 || '').replace(/"/g, '""')}"`,
    `"${(m.companion3 || '').replace(/"/g, '""')}"`,
    `"${getStatusLabel(m.status)}"`,
    `"${(m.notes || '').replace(/"/g, '""')}"`,
  ]);

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens Arabic correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(missions: Mission[], filename = 'نسخة_احتياطية_مهام_التفتيش.json') {
  const exportPayload = {
    appName: 'نظام تدبير مهام التفتيش والمراقبة',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalMissions: missions.length,
    missions,
  };
  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
