const fs = require('fs');

const keysToInject = {
  hd_reports: "Reports",
  hd_add_staff: "Add Staff",
  hd_central_erp: "CENTRAL HOSPITAL ERP",
  hd_system_online: "SYSTEM ONLINE",
  hd_today_revenue: "Today Revenue",
  hd_vs_last_week: "vs last week",
  hd_98_attendance: "98% attendance",
  hd_available: "Available:",
  hd_target: "Target:",
  // from previous slide we already injected hd_live_overview etc
};

const zhInject = {
  hd_reports: "报告",
  hd_add_staff: "添加员工",
  hd_central_erp: "中心医院ERP系统",
  hd_system_online: "系统在线",
  hd_today_revenue: "今日收入",
  hd_vs_last_week: "相比上周",
  hd_98_attendance: "98%出勤率",
  hd_available: "可用:",
  hd_target: "目标:"
};

let i18nContent = fs.readFileSync('src/i18n.ts', 'utf8');
const enStartMatch = 'const resources = {\n  en: {\n    translation: {';
const zhStartMatch = '  zh: {\n    translation: {';

if (!i18nContent.includes('hd_central_erp')) {
  const entriesEn = Object.entries(keysToInject).map(([k, v]) => `\n      "${k}": ${JSON.stringify(v)},`).join('');
  let newI18n = i18nContent.replace(enStartMatch, enStartMatch + entriesEn);
  
  const entriesZh = Object.entries(zhInject).map(([k, v]) => `\n      "${k}": ${JSON.stringify(v)},`).join('');
  newI18n = newI18n.replace(zhStartMatch, zhStartMatch + entriesZh);
  
  fs.writeFileSync('src/i18n.ts', newI18n);
  console.log('Successfully injected hospital dash translations to i18n.ts');
} else {
  console.log('Translations already exist in i18n.ts');
}

// Now replace in HospitalDashboard.tsx
let dashboardCode = fs.readFileSync('src/components/dashboards/HospitalDashboard.tsx', 'utf8');

const replacements = [
  { search: "'Today Revenue'", replace: "t('hd_today_revenue')" },
  { search: "'vs last week'", replace: "t('hd_vs_last_week')" },
  { search: "'98% attendance'", replace: "t('hd_98_attendance')" },
  { search: "'Available: 42'", replace: "\`\${t('hd_available')} 42\`" },
  { search: "'Target: 120k'", replace: "\`\${t('hd_target')} 120k\`" },
  { search: "CENTRAL HOSPITAL ERP", replace: "{t('hd_central_erp')}" },
  { search: "SYSTEM ONLINE", replace: "{t('hd_system_online')}" },
  { search: "Reports", replace: "{t('hd_reports')}" },
  { search: "Add Staff", replace: "{t('hd_add_staff')}" },
  { search: "label: 'Live Overview'", replace: "label: t('hd_live_overview')" },
  { search: "label: 'Staff & Attendance'", replace: "label: t('hd_staff_attendance')" },
  { search: "label: 'Revenue & Billing'", replace: "label: t('hd_revenue_billing')" },
  { search: "Live Patient Influx vs Bed Capacity", replace: "{t('hd_patient_influx')}" },
  { search: "Staff Roster (Cross-Department)", replace: "{t('hd_staff_roster')}" },
  { search: "Vendor Commissions & Withdrawable Funds", replace: "{t('hd_vendor_commissions')}" },
  { search: "Commission Balance", replace: "{t('hd_commission_balance')}" },
  { search: "Withdraw Funds", replace: "{t('hd_withdraw_funds')}" },
  { search: "Processing...", replace: "{t('hd_processing')}" }
];

replacements.forEach(({ search, replace }) => {
  // Try global replace if it's a string, otherwise just normal string replace
  dashboardCode = dashboardCode.split(search).join(replace);
});

fs.writeFileSync('src/components/dashboards/HospitalDashboard.tsx', dashboardCode);
console.log('Replaced texts in HospitalDashboard.tsx');
