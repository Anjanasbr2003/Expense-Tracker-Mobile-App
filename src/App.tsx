import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { BottomNav, type TabType } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { MobileFrame } from './components/layout/MobileFrame';
import { DashboardScreen } from './screens/DashboardScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ExpenseFormModal } from './components/expense/ExpenseFormModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { MonthlyBudgetPromptModal } from './components/budget/MonthlyBudgetPromptModal';
import { syncWidgetMetrics } from './utils/widgetSync';
import type { Expense } from './types';

const MainApp: React.FC = () => {
  const { settings, currency, currentMonthBudget, shouldPromptMonthlyBudget } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isManualMonthlyPromptOpen, setIsManualMonthlyPromptOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [initialFormDate, setInitialFormDate] = useState<string | undefined>();
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const { deleteExpense, todayTotal, thisMonthTotal } = useExpenses();

  // Synchronize live metrics with Android Home Screen Widgets
  useEffect(() => {
    syncWidgetMetrics(todayTotal, thisMonthTotal, currentMonthBudget || 50000, currency.symbol);
  }, [todayTotal, thisMonthTotal, currentMonthBudget, currency.symbol]);

  // Handle widget shortcut events from Android home screen widgets
  useEffect(() => {
    const handleWidgetShortcut = (event: any) => {
      const action = event.detail?.action;
      if (action === 'add' || action === 'add_food' || action === 'add_transport') {
        setSelectedExpense(null);
        setInitialFormDate(undefined);
        setIsFormOpen(true);
      } else if (action === 'history') {
        setActiveTab('history');
      }
    };

    window.addEventListener('spendwise_widget_shortcut', handleWidgetShortcut);

    const handleOpenMonthlyBudgetPrompt = () => {
      setIsManualMonthlyPromptOpen(true);
    };
    window.addEventListener('open_monthly_budget_prompt', handleOpenMonthlyBudgetPrompt);

    return () => {
      window.removeEventListener('spendwise_widget_shortcut', handleWidgetShortcut);
      window.removeEventListener('open_monthly_budget_prompt', handleOpenMonthlyBudgetPrompt);
    };
  }, []);

  const handleOpenAdd = (date?: string) => {
    setSelectedExpense(null);
    setInitialFormDate(date);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleRequestDelete = (expense: Expense) => {
    setIsFormOpen(false);
    setDeletingExpense(expense);
  };

  const handleConfirmDelete = async () => {
    if (deletingExpense) {
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  // Screen header configurations
  const getHeaderInfo = () => {
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    switch (activeTab) {
      case 'home':
        return {
          title: 'SpendWise',
          subtitle: dateFormatted,
        };
      case 'history':
        return {
          title: 'Transactions',
          subtitle: 'All spending history',
        };
      case 'analytics':
        return {
          title: 'Spending Insights',
          subtitle: 'Monthly & yearly analytics',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Preferences & backup',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <>
      <MobileFrame>
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onAvatarClick={() => setActiveTab('settings')}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              activeTab === 'home' ? 'flex' : 'hidden'
            }`}
          >
            <DashboardScreen
              onOpenAddExpense={handleOpenAdd}
              onEditExpense={handleOpenEdit}
              onNavigateToHistory={() => setActiveTab('history')}
            />
          </div>

          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              activeTab === 'history' ? 'flex' : 'hidden'
            }`}
          >
            <HistoryScreen
              onOpenAddExpense={handleOpenAdd}
              onEditExpense={handleOpenEdit}
              onRequestDelete={handleRequestDelete}
            />
          </div>

          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              activeTab === 'analytics' ? 'flex' : 'hidden'
            }`}
          >
            <AnalyticsScreen onOpenAddExpense={handleOpenAdd} />
          </div>

          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              activeTab === 'settings' ? 'flex' : 'hidden'
            }`}
          >
            <SettingsScreen />
          </div>
        </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={handleOpenAdd}
      />

      {/* Add / Edit Expense Bottom Sheet Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpense(null);
          setInitialFormDate(undefined);
        }}
        initialExpense={selectedExpense}
        initialDate={initialFormDate}
        onRequestDelete={handleRequestDelete}
      />

      {/* Delete Expense Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        title="Delete Expense?"
        message={`Are you sure you want to delete this expense of ${currency.symbol} ${deletingExpense?.amount.toFixed(
          2
        )}? This cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />
      </MobileFrame>

      {/* First-Time Onboarding Modal (Shown only on first launch) */}
      {!settings.hasCompletedOnboarding && (
        <OnboardingModal onComplete={() => {}} />
      )}

      {/* 1st of the Month Budget Planning Prompt Modal */}
      {settings.hasCompletedOnboarding && (
        <MonthlyBudgetPromptModal
          isOpen={shouldPromptMonthlyBudget || isManualMonthlyPromptOpen}
          onClose={() => setIsManualMonthlyPromptOpen(false)}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <ExpenseProvider>
        <MainApp />
      </ExpenseProvider>
    </SettingsProvider>
  );
}
