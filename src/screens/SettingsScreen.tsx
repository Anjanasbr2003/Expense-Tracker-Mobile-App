import React, { useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpenseContext';
import { SUPPORTED_CURRENCIES, type ThemeMode } from '../types';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from '../components/common/CategoryIcon';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportExpensesToCSV, exportAllDataToJSON, importDataFromJSON } from '../utils/exportImport';
import {
  Coins,
  Palette,
  Target,
  Tags,
  Download,
  Upload,
  Database,
  Trash2,
  Plus,
  Check,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { executeThemeTransition } from '../utils/themeTransition';

export const SettingsScreen: React.FC = () => {
  const { settings, currency, setCurrencyCode, setTheme, setMonthlyBudget } = useSettings();
  const {
    expenses,
    categories,
    demoCount,
    loadDemo,
    clearDemo,
    clearAllData,
    addCategory,
    deleteCategory,
    refreshData,
  } = useExpenses();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showClearDemoConfirm, setShowClearDemoConfirm] = useState<boolean>(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string>('');

  const [budgetValue, setBudgetValue] = useState<string>(
    (settings.defaultMonthlyBudget || 60000).toString()
  );
  const [isSavingBudget, setIsSavingBudget] = useState<boolean>(false);

  const [showAddCat, setShowAddCat] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catIcon, setCatIcon] = useState<string>('Tag');
  const [catColor, setCatColor] = useState<string>('#10b981');

  const flashMessage = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 3000);
  };

  const handleSaveBudget = async () => {
    const parsed = parseFloat(budgetValue);
    if (!isNaN(parsed) && parsed >= 0) {
      await setMonthlyBudget(parsed);
      setIsSavingBudget(false);
      flashMessage('Monthly target updated!');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      await addCategory({
        name: catName.trim(),
        icon: catIcon,
        color: catColor,
        isDefault: false,
      });
      setCatName('');
      setShowAddCat(false);
      flashMessage(`Category "${catName.trim()}" created!`);
    } catch (err: any) {
      flashMessage(err.message || 'Error creating category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
      flashMessage(`Category "${name}" removed`);
    } catch (err: any) {
      flashMessage(err.message || 'Cannot delete default category');
    }
  };

  const handleLoadDemo = async () => {
    const count = await loadDemo();
    flashMessage(`Loaded ${count} sample expenses!`);
  };

  const handleClearDemo = async () => {
    const count = await clearDemo();
    setShowClearDemoConfirm(false);
    flashMessage(`Removed ${count} demo records.`);
  };

  const handleClearAll = async () => {
    await clearAllData();
    setShowClearAllConfirm(false);
    flashMessage('All expense records reset.');
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      flashMessage('No expenses to export.');
      return;
    }
    exportExpensesToCSV(expenses, categories, currency.code);
    flashMessage('CSV export created!');
  };

  const handleExportJSON = async () => {
    await exportAllDataToJSON();
    flashMessage('Full JSON backup downloaded!');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await importDataFromJSON(content);
        await refreshData();
        flashMessage(`Imported ${res.expensesCount} expenses!`);
      } catch (err: any) {
        flashMessage(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-3.5 space-y-3">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="p-2.5 bg-emerald-500 text-black rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check size={15} strokeWidth={2.5} />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 1. Currency Settings */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Coins size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Default Currency
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {currency.name} ({currency.symbol})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
            const isSelected = settings.currencyCode === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => setCurrencyCode(curr.code)}
                className={`py-2.5 px-2 rounded-xl text-center transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold ring-1 ring-emerald-500/40 shadow-xs'
                    : 'glass-button text-neutral-700 dark:text-neutral-300 font-medium'
                }`}
              >
                <div className="text-xs font-bold">{curr.code}</div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{curr.symbol}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Theme Preferences */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Palette size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Appearance
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              OLED Deep Black or Light
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {(
            [
              { id: 'dark', label: 'Deep Black' },
              { id: 'light', label: 'Light' },
              { id: 'system', label: 'Device' },
            ] as const
          ).map((t) => {
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={(e) => executeThemeTransition(() => setTheme(t.id as ThemeMode), e)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold ring-1 ring-emerald-500/40 shadow-xs'
                    : 'glass-button text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Monthly Budget */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Target size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Monthly Budget Limit
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Dashboard spending target
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <div className="relative flex-1 flex items-center rounded-xl glass-panel px-3 py-2">
            <span className="text-xs font-bold text-neutral-400 mr-2">{currency.symbol}</span>
            <input
              type="number"
              min="0"
              step="500"
              value={budgetValue}
              onChange={(e) => {
                setBudgetValue(e.target.value);
                setIsSavingBudget(true);
              }}
              className="w-full text-xs font-bold tabular-nums text-neutral-900 dark:text-white bg-transparent outline-hidden"
            />
          </div>

          {isSavingBudget && (
            <button
              type="button"
              onClick={handleSaveBudget}
              className="px-4 py-2.5 rounded-xl glass-button-primary text-black text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              Save
            </button>
          )}
        </div>
      </section>

      {/* 4. Category Management */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Tags size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                Categories
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {categories.length} total categories
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCat(!showAddCat)}
            className="px-2.5 py-1.5 rounded-xl glass-button text-[11px] font-bold text-emerald-400 flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Custom</span>
          </button>
        </div>

        {showAddCat && (
          <form onSubmit={handleCreateCategory} className="p-3 glass-card rounded-2xl space-y-2.5">
            <input
              type="text"
              placeholder="Category Name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-panel text-neutral-900 dark:text-white outline-hidden"
              required
            />
            <div className="flex items-center gap-2">
              <select
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl glass-panel text-neutral-900 dark:text-white outline-hidden"
              >
                {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                  <option key={iconName} value={iconName} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                    {iconName}
                  </option>
                ))}
              </select>
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="w-9 h-8 rounded-xl cursor-pointer border border-neutral-200 dark:border-white/10 p-0.5 bg-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl glass-button-primary text-black text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 rounded-xl glass-button text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={13} />
                </div>
                <span className="font-semibold text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
                  {cat.name}
                </span>
              </div>

              {!cat.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 cursor-pointer active:scale-90 transition-all"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Demo Data Controls */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                Demo Sample Data
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {demoCount > 0 ? `${demoCount} demo expenses loaded` : 'No demo data active'}
              </p>
            </div>
          </div>
          {demoCount > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="flex-1 py-3 px-3.5 rounded-xl glass-button text-indigo-500 dark:text-indigo-300 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles size={14} />
            <span>Load Samples</span>
          </button>

          {demoCount > 0 && (
            <button
              type="button"
              onClick={() => setShowClearDemoConfirm(true)}
              className="py-3 px-3.5 rounded-xl glass-button text-neutral-700 dark:text-neutral-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              Clear Demo
            </button>
          )}
        </div>
      </section>

      {/* 6. Offline Data Backup & Restore */}
      <section className="glass-panel p-3.5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
              Data Management & Backup
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              100% offline, persistent on this phone
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-3 rounded-2xl glass-button text-left active:scale-95 transition-all cursor-pointer"
          >
            <Download size={15} className="text-teal-400 mb-1" />
            <div className="text-xs font-bold text-neutral-900 dark:text-white">Export CSV</div>
            <div className="text-[10px] text-neutral-500">Spreadsheet ready</div>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3 rounded-2xl glass-button text-left active:scale-95 transition-all cursor-pointer"
          >
            <Download size={15} className="text-teal-400 mb-1" />
            <div className="text-xs font-bold text-neutral-900 dark:text-white">Full JSON Backup</div>
            <div className="text-[10px] text-neutral-500">All data & settings</div>
          </button>
        </div>

        <div className="pt-0.5">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-white/15 glass-button text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Restore / Import JSON Backup</span>
          </button>
        </div>
      </section>

      {/* 7. Danger Zone */}
      <section className="bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20 space-y-2">
        <div className="flex items-center gap-1.5 text-rose-400">
          <AlertOctagon size={15} />
          <h4 className="text-[10px] font-bold uppercase tracking-wider">Reset Data</h4>
        </div>
        <p className="text-[11px] text-neutral-400">
          Permanently delete all expenses stored on this device.
        </p>
        <button
          type="button"
          onClick={() => setShowClearAllConfirm(true)}
          className="w-full py-3 px-4 rounded-xl glass-button-danger text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-1 cursor-pointer shadow-md"
        >
          <Trash2 size={14} />
          <span>Reset All Expenses</span>
        </button>
      </section>

      {/* Clear Demo Confirmation */}
      <ConfirmModal
        isOpen={showClearDemoConfirm}
        title="Remove Demo Data?"
        message="This will delete all sample records. Any real expenses you entered will remain safe."
        confirmText="Remove Demo Records"
        isDestructive={true}
        onConfirm={handleClearDemo}
        onCancel={() => setShowClearDemoConfirm(false)}
      />

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Reset All Expense Data?"
        message="Are you sure you want to delete all expenses? This action cannot be undone unless you have a JSON backup."
        confirmText="Yes, Delete All"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearAllConfirm(false)}
      />
    </div>
  );
};
