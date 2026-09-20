/**
 * Synchronize live metrics with Android Home Screen Widgets
 */
export function syncWidgetMetrics(
  todaySpent: number,
  monthSpent: number,
  monthlyBudget: number,
  currencySymbol: string
) {
  try {
    if (
      typeof window !== 'undefined' &&
      (window as any).SpendWiseWidgetBridge?.syncWidgetData
    ) {
      (window as any).SpendWiseWidgetBridge.syncWidgetData(
        todaySpent,
        monthSpent,
        monthlyBudget,
        currencySymbol || 'Rs.'
      );
    }
  } catch (err) {
    console.debug('Widget sync notice:', err);
  }
}
