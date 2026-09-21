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
  'Amount': 'Amount',
  'Note': 'Note (Optional)',
  'Date': 'Date',
  'Category': 'Category',
  'Payment Method': 'Payment Method',
  'Cash': 'Cash',
  'Card': 'Card',
  'Bank Transfer': 'Bank Transfer',
  'Cancel': 'Cancel',
  'Delete': 'Delete',
  'Add Expense': 'Add Expense',
  'Update Expense': 'Update Expense',
  'Theme Preferences': 'Theme Preferences',
  'Dark Mode': 'Dark Mode',
  'Light Mode': 'Light Mode',
  'System Default': 'System Default',
  'Data & Backup': 'Data & Backup',
  'Export Data': 'Export Data',
  'Import Data': 'Import Data',
  'Currency Settings': 'Currency Settings',
  'Manage Categories': 'Manage Categories',
  // History & Transactions
  'All spending history': 'All spending history',
  'Spending Footprint': 'Spending Footprint',
  'This Month Overview': 'This Month Overview',
  'Total Spendings': 'Total Spendings',
  'Search transactions...': 'Search transactions...',
  
  // Categories & Breakdowns
  'Essentials': 'Essentials',
  'Treat Yourself': 'Treat Yourself',
  'Bills & Finance': 'Bills & Finance',
  'Needs': 'Needs',
  'Wants': 'Wants',
  'Buffer': 'Buffer',
  'Treats': 'Treats',
  'Finance': 'Finance',
  
  // Settings & Budget
  'Monthly Budget Limits': 'Monthly Budget Limits',
  'Active month targets and baseline cap': 'Active month targets and baseline cap',
  'Budget': 'Budget',
  'Auto-applies on 1st of month': 'Auto-applies on 1st of month',
  'Preview 1st-of-Month Budget Prompt': 'Preview 1st-of-Month Budget Prompt',
  'Spent:': 'Spent:',
  'Month': 'Month',
  'Monthly & yearly analytics': 'Monthly & yearly analytics',
  'Preferences & backup': 'Preferences & backup',
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
  'Amount': 'ගාණ',
  'Note': 'සටහනක් (අත්‍යවශ්‍ය නෑ)',
  'Date': 'දිනය',
  'Category': 'වර්ගය',
  'Payment Method': 'ගෙවපු විදිය',
  'Cash': 'අතින් (Cash)',
  'Card': 'කාඩ් එකෙන්',
  'Bank Transfer': 'බෑන්ක් එකෙන්',
  'Cancel': 'කැන්සල්',
  'Delete': 'මකන්න',
  'Add Expense': 'වියදම දාන්න',
  'Update Expense': 'වියදම හදන්න',
  'Theme Preferences': 'පෙනුම',
  'Dark Mode': 'අඳුරු (Dark)',
  'Light Mode': 'සුදු (Light)',
  'System Default': 'ෆෝන් එකේ විදියට',
  'Data & Backup': 'බැකප් එක',
  'Export Data': 'ඩේටා ගන්න',
  'Import Data': 'ඩේටා දාන්න',
  'Currency Settings': 'සල්ලි වර්ගය',
  'Manage Categories': 'වර්ග හදන්න',
  
  // History & Transactions
  'All spending history': 'ඔක්කොම වියදම් ඉතිහාසය',
  'Spending Footprint': 'වියදම් සටහන',
  'This Month Overview': 'මේ මාසේ සාරාංශය',
  'Total Spendings': 'මුළු වියදම',
  'Search transactions...': 'වියදම් හොයන්න...',
  
  // Categories & Breakdowns
  'Essentials': 'අත්‍යවශ්‍ය',
  'Treat Yourself': 'විනෝදයට',
  'Bills & Finance': 'බිල් සහ ණය',
  'Needs': 'අවශ්‍යතා',
  'Wants': 'ආසාවල්',
  'Buffer': 'ඉතුරු',
  'Treats': 'විනෝදයට',
  'Finance': 'මූල්‍ය',
  
  // Settings & Budget
  'Monthly Budget Limits': 'මාසික බජට් සීමාවන්',
  'Active month targets and baseline cap': 'මේ මාසේ ඉලක්ක සහ සාමාන්‍ය සීමාව',
  'Budget': 'බජට් එක',
  'Auto-applies on 1st of month': 'මාසේ 1 වෙනිදාට ඉබේම යාවත්කාලීන වෙනවා',
  'Preview 1st-of-Month Budget Prompt': 'මාසේ 1 වෙනිදා එන මැසේජ් එක බලන්න',
  'Spent:': 'වියදම් කළා:',
  'Month': 'මාසය',
  'Monthly & yearly analytics': 'මාසික සහ වාර්ෂික විස්තර',
  'Preferences & backup': 'සැකසුම් සහ බැකප්',
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
