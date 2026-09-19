import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
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
import type { Expense } from './types';

import { LaunchScreen } from './components/common/LaunchScreen';

const MainApp: React.FC = () => {
  const [hasLaunched, setHasLaunched] = useState<boolean>(() => {
    return sessionStorage.getItem('spendwise_launched') === 'true';
  });
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const { deleteExpense } = useExpenses();

  const handleLaunchComplete = () => {
    sessionStorage.setItem('spendwise_launched', 'true');
    setHasLaunched(true);
  };

  const handleOpenAdd = () => {
    setSelectedExpense(null);
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
      {!hasLaunched && <LaunchScreen onComplete={handleLaunchComplete} />}

      <MobileFrame>
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div key={activeTab} className="flex-1 flex flex-col overflow-hidden animate-fade-slide-up">
            {activeTab === 'home' && (
              <DashboardScreen
                onOpenAddExpense={handleOpenAdd}
                onEditExpense={handleOpenEdit}
                onNavigateToHistory={() => setActiveTab('history')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryScreen
                onOpenAddExpense={handleOpenAdd}
                onEditExpense={handleOpenEdit}
                onRequestDelete={handleRequestDelete}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsScreen onOpenAddExpense={handleOpenAdd} />
            )}

            {activeTab === 'settings' && <SettingsScreen />}
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
        }}
        initialExpense={selectedExpense}
        onRequestDelete={handleRequestDelete}
      />

      {/* Delete Expense Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        title="Delete Expense?"
        message={`Are you sure you want to delete this expense of Rs. ${deletingExpense?.amount.toFixed(
          2
        )}? This cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingExpense(null)}
      />
      </MobileFrame>
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
