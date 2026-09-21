import { useSettings } from '../context/SettingsContext';

type Translations = Record<string, string>;

const en: Translations = {
  // Navigation & Headers
  'SpendWise': 'SpendWise',
  'Transactions': 'Transactions',
  'Spending Insights': 'Spending Insights',
  'Settings': 'Settings',
  'Home': 'Home',
  'History': 'History',
  'Analytics': 'Analytics',
  
  // Dashboard Sub-Views
  'Savings': 'Savings',
  'Calendar': 'Calendar',
  'Insights': 'Insights',
  'Bills': 'Bills',
  'Spendings': 'Spendings',
  'Planned Recurring Bills': 'Planned Recurring Bills',
  
  // Dashboard Actions
  'Record New Expense': 'Record New Expense',
  'Fast entry': 'Fast entry',
  'Show All': 'Show All',
  'See Details': 'See Details',
  'Add Expense for': 'Add Expense for',
  'Log another expense on this day': 'Log another expense on this day',
  
  // States
  'No recurring bills recorded yet': 'No recurring bills recorded yet',
  'No expenses on': 'No expenses on',
  'No transactions logged yet': 'No transactions logged yet',
  'Over Budget': 'Over Budget',
  'Left': 'Left',
  'of': 'of',
  'Today': 'Today',
  
  // General
  'Active Month': 'Active Month',
  'Default Baseline Budget': 'Default Baseline Budget',
  'Daily Budget Limit': 'Daily Budget Limit',
  'Weekly Budget Limit': 'Weekly Budget Limit',
  'Save': 'Save',
  'Language': 'Language',
  'Daily': 'Daily',
  'Breakdown': 'Breakdown',
  'Monthly': 'Monthly',
  'Yearly': 'Yearly',
};

const si: Translations = {
  // Navigation & Headers
  'SpendWise': 'SpendWise',
  'Transactions': 'වියදම් ලිස්ට් එක',
  'Spending Insights': 'වියදම් විස්තර',
  'Settings': 'සැකසුම්',
  'Home': 'මුල් පිටුව',
  'History': 'පරණ වියදම්',
  'Analytics': 'විශ්ලේෂණ',
  
  // Dashboard Sub-Views
  'Savings': 'ඉතුරු සල්ලි',
  'Calendar': 'කැලැන්ඩරය',
  'Insights': 'අවබෝධය',
  'Bills': 'බිල්පත්',
  'Spendings': 'ඔක්කොම වියදම්',
  'Planned Recurring Bills': 'මාසික බිල්පත්',
  
  // Dashboard Actions
  'Record New Expense': 'අලුත් වියදමක් දාමු',
  'Fast entry': 'ඉක්මනින් දාන්න',
  'Show All': 'ඔක්කොම බලන්න',
  'See Details': 'විස්තර බලන්න',
  'Add Expense for': 'මේ දවසට වියදමක් දාන්න:',
  'Log another expense on this day': 'තව වියදමක් දාන්න',
  
  // States
  'No recurring bills recorded yet': 'තාම බිල් මුකුත් නෑ',
  'No expenses on': 'මේ දවසේ වියදම් නෑ',
  'No transactions logged yet': 'තාම වියදම් මුකුත් දාලා නෑ',
  'Over Budget': 'බජට් එක පැනලා!',
  'Left': 'ඉතුරුයි',
  'of': '/',
  'Today': 'අද:',
  
  // General
  'Active Month': 'මේ මාසේ',
  'Default Baseline Budget': 'සාමාන්‍ය මාසික බජට් එක',
  'Daily Budget Limit': 'දවසේ බජට් එක',
  'Weekly Budget Limit': 'සතියේ බජට් එක',
  'Save': 'සුරකින්න',
  'Language': 'භාෂාව',
  'Daily': 'දවසේ',
  'Breakdown': 'වර්ග කිරීම',
  'Monthly': 'මාසික',
  'Yearly': 'වාර්ෂික',
};

const dictionaries = { en, si };

export function useTranslation() {
  const { settings } = useSettings();
  const lang = settings.language || 'en';
  const dict = dictionaries[lang] || en;

  const t = (key: string): string => {
    return dict[key] || key;
  };

  return { t, lang };
}
