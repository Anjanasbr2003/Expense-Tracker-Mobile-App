import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { BottomNav, type TabType } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { TabTransition } from './components/layout/TabTransition';
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

  const { expenses, deleteExpense, todayTotal, thisMonthTotal } = useExpenses();

  // Synchronize live metrics with Android Home Screen Widgets
  useEffect(() => {
    const monthlyRemaining = (currentMonthBudget || 50000) - thisMonthTotal;
    const weeklyBudget = settings.defaultWeeklyBudget || 15000;
    // Rough weekly spent calculation (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklySpent = expenses
      .filter((e: Expense) => new Date(e.date) >= sevenDaysAgo)
      .reduce((acc: number, curr: Expense) => acc + curr.amount, 0);
    const weeklyRemaining = weeklyBudget - weeklySpent;

    syncWidgetMetrics(
      todayTotal, 
      thisMonthTotal, 
      currentMonthBudget || 50000, 
      currency.symbol, 
      monthlyRemaining, 
      weeklyRemaining
    );
  }, [todayTotal, thisMonthTotal, currentMonthBudget, currency.symbol, settings.defaultWeeklyBudget, expenses]);

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

        <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          <TabTransition isActive={activeTab === 'home'}>
            <DashboardScreen
              onOpenAddExpense={handleOpenAdd}
              onEditExpense={handleOpenEdit}
              onNavigateToHistory={() => setActiveTab('history')}
            />
          </TabTransition>

          <TabTransition isActive={activeTab === 'history'}>
            <HistoryScreen
              onOpenAddExpense={handleOpenAdd}
              onEditExpense={handleOpenEdit}
              onRequestDelete={handleRequestDelete}
            />
          </TabTransition>

          <TabTransition isActive={activeTab === 'analytics'}>
            <AnalyticsScreen onOpenAddExpense={handleOpenAdd} />
          </TabTransition>

          <TabTransition isActive={activeTab === 'settings'}>
            <SettingsScreen />
          </TabTransition>
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
