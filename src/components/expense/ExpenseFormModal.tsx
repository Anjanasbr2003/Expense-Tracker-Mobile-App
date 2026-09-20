import React, { useState, useEffect } from 'react';
import type { Expense, PaymentMethod } from '../../types';
import { useExpenses } from '../../context/ExpenseContext';
import { useSettings } from '../../context/SettingsContext';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from '../common/CategoryIcon';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateUtils';
import { X, Calendar, Clock, Plus, Trash2, Check } from 'lucide-react';
import { hapticLight, hapticSuccess, hapticWarning } from '../../utils/haptics';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpense?: Expense | null;
  initialDate?: string;
  onRequestDelete?: (expense: Expense) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Bank Transfer', 'Other'];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  initialExpense,
  initialDate,
  onRequestDelete,
}) => {
  const { categories, addExpense, updateExpense, addCategory } = useExpenses();
  const { currency } = useSettings();

  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isAmountFocused, setIsAmountFocused] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Custom Category inline state
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');
  const [newCatColor, setNewCatColor] = useState<string>('#10b981');

  const isEditMode = !!initialExpense;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  };

  useEffect(() => {
    if (initialExpense) {
      setAmountStr(initialExpense.amount.toString());
      setSelectedCategoryId(initialExpense.categoryId);
      setDate(initialExpense.date);
      setTime(initialExpense.time || getCurrentTimeString());
      setPaymentMethod(initialExpense.paymentMethod);
      setNote(initialExpense.note || '');
    } else {
      setAmountStr('');
      const defaultCat = categories.find((c) => c.id === 'cat-food') || categories[0];
      setSelectedCategoryId(defaultCat?.id || '');
      setDate(initialDate || getTodayDateString());
      setTime(getCurrentTimeString());
      setPaymentMethod('Cash');
      setNote('');
    }
    setErrorMsg('');
    setIsShaking(false);
    setSaveSuccess(false);
    setIsClosing(false);
    setShowAddCategory(false);
  }, [initialExpense, initialDate, isOpen, categories]);

  if (!isOpen) return null;

  const triggerShake = (msg: string) => {
    hapticWarning();
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 320);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerShake('Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedCategoryId) {
      triggerShake('Please select a category');
      return;
    }

    try {
      if (isEditMode && initialExpense) {
        await updateExpense(initialExpense.id, {
          amount: Math.round(parsedAmount * 100) / 100,
          categoryId: selectedCategoryId,
          date,
          time,
          paymentMethod,
          note: note.trim(),
        });
      } else {
        await addExpense({
          amount: Math.round(parsedAmount * 100) / 100,
          categoryId: selectedCategoryId,
          date,
          time,
          paymentMethod,
          note: note.trim(),
        });
      }
      hapticSuccess();
      setSaveSuccess(true);
      setTimeout(() => {
        triggerClose();
      }, 360);
    } catch (err: any) {
      triggerShake(err.message || 'Failed to save expense');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const created = await addCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
        isDefault: false,
      });
      setSelectedCategoryId(created.id);
      setShowAddCategory(false);
      setNewCatName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category');
    }
  };

  const handleQuickDate = (type: 'today' | 'yesterday') => {
    const now = new Date();
    if (type === 'today') {
      setDate(getTodayDateString());
    } else {
      now.setDate(now.getDate() - 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      setDate(`${y}-${m}-${d}`);
    }
  };

  return (
    <div
      onClick={triggerClose}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'animate-in fade-in duration-150'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[88%] sm:max-h-[90%] flex flex-col glass-panel rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-transform duration-200 ${
          isClosing
            ? 'translate-y-full opacity-0'
            : 'animate-in slide-in-from-bottom duration-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-neutral-200/80 dark:border-white/[0.08] shrink-0">
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {isEditMode ? 'Edit Expense' : 'New Expense'}
          </h2>

          <div className="flex items-center gap-1.5">
            {isEditMode && onRequestDelete && initialExpense && (
              <button
                type="button"
                onClick={() => onRequestDelete(initialExpense)}
                className="w-8 h-8 rounded-xl glass-button text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={triggerClose}
              className="w-8 h-8 rounded-xl glass-button text-neutral-400 hover:text-neutral-200 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold animate-fade-slide-up">
              {errorMsg}
            </div>
          )}

          {/* Amount Display / Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Amount
            </label>
            <div
              className={`relative flex items-center rounded-2xl glass-panel px-3.5 py-2.5 transition-all duration-200 ${
                isShaking ? 'animate-shake border-rose-500/80 ring-2 ring-rose-500/30' : ''
              } ${
                isAmountFocused
                  ? 'scale-[1.01] border-emerald-500/80 shadow-[0_0_16px_rgba(16,185,129,0.2)]'
                  : 'border-neutral-200/80 dark:border-white/[0.08]'
              }`}
            >
              <span className="text-xl font-bold text-neutral-400 mr-2 select-none">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50 bg-transparent outline-hidden tracking-tight"
                required
              />
            </div>
            {/* Big User-Friendly Quick Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
              {[50, 100, 200, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setAmountStr(amt.toString());
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold tabular-nums rounded-xl glass-button text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>Custom</span>
              </button>
            </div>

            {/* Inline Custom Category Creator */}
            {showAddCategory && (
              <div className="p-3 mb-2.5 glass-panel rounded-2xl space-y-2">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-button text-neutral-900 dark:text-white outline-hidden focus:border-emerald-500"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl glass-button text-neutral-900 dark:text-white outline-hidden"
                  >
                    {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>

                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700 p-0.5 bg-transparent"
                  />

                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-2 text-xs font-bold rounded-xl glass-button-primary text-black active:scale-95 transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setSelectedCategoryId(cat.id);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className={`relative flex items-center gap-2 p-2.5 rounded-2xl text-left border transition-all duration-200 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold shadow-xs'
                        : 'glass-button text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} size={13} />
                    </div>
                    <span className="text-[11px] truncate font-semibold">{cat.name}</span>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-black flex items-center justify-center animate-scale-check">
                        <Check size={9} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Date & Time
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDate('today')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    date === getTodayDateString()
                      ? 'glass-button-primary text-black'
                      : 'glass-button text-neutral-400'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate('yesterday')}
                  className="px-3 py-1 text-[11px] font-bold rounded-xl glass-button text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative flex items-center">
                <Calendar size={14} className="absolute left-3 text-neutral-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-2.5 py-2 rounded-2xl glass-button text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <Clock size={14} className="absolute left-3 text-neutral-400 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-2.5 py-2 rounded-2xl glass-button text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 rounded-2xl text-[11px] font-bold border text-center transition-all duration-200 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 scale-[1.02] shadow-xs'
                        : 'glass-button text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch, Coffee, Grocery..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              className="w-full px-3.5 py-2 rounded-2xl glass-button text-xs text-neutral-900 dark:text-neutral-100 outline-hidden focus:border-emerald-500 transition-colors placeholder:text-neutral-500"
            />
          </div>
        </form>

        {/* Big User-Friendly Glass CTA Footer */}
        <div className="p-3.5 glass-dock shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full h-12 py-3 px-5 rounded-2xl font-bold text-sm shadow-md active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-400 text-black scale-[1.01]'
                : 'glass-button-primary text-black'
            }`}
          >
            {saveSuccess ? (
              <div className="flex items-center gap-2 animate-scale-check">
                <Check size={18} strokeWidth={3} />
                <span>{isEditMode ? 'Expense Updated!' : 'Expense Added!'}</span>
              </div>
            ) : (
              <>
                <Check size={18} strokeWidth={2.6} />
                <span>{isEditMode ? 'Update Expense' : 'Save Expense'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
