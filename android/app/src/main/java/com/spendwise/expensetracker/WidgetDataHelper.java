package com.spendwise.expensetracker;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import java.text.NumberFormat;
import java.util.Locale;

public class WidgetDataHelper {
    public static final String PREFS_NAME = "spendwise_widget_prefs";
    public static final String KEY_TODAY_SPENT = "today_spent";
    public static final String KEY_MONTH_SPENT = "month_spent";
    public static final String KEY_MONTHLY_BUDGET = "monthly_budget";
    public static final String KEY_CURRENCY = "currency_symbol";

    public static void saveMetrics(Context context, double todaySpent, double monthSpent, double monthlyBudget, String currency) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
             .putFloat(KEY_TODAY_SPENT, (float) todaySpent)
             .putFloat(KEY_MONTH_SPENT, (float) monthSpent)
             .putFloat(KEY_MONTHLY_BUDGET, (float) monthlyBudget)
             .putString(KEY_CURRENCY, currency != null ? currency : "Rs.")
             .apply();

        updateAllWidgets(context);
    }

    public static String formatCurrency(double amount, String symbol) {
        if (Double.isNaN(amount) || Double.isInfinite(amount)) amount = 0.0;
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.US);
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        String s = (symbol != null && !symbol.isEmpty()) ? symbol : "Rs.";
        return s + " " + nf.format(amount);
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);

        // 1. Update Glance Widgets
        ComponentName glanceName = new ComponentName(context, SpendWiseGlanceWidget.class);
        int[] glanceIds = manager.getAppWidgetIds(glanceName);
        if (glanceIds != null && glanceIds.length > 0) {
            Intent intent = new Intent(context, SpendWiseGlanceWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, glanceIds);
            context.sendBroadcast(intent);
        }

        // 2. Update Budget Widgets
        ComponentName budgetName = new ComponentName(context, SpendWiseBudgetWidget.class);
        int[] budgetIds = manager.getAppWidgetIds(budgetName);
        if (budgetIds != null && budgetIds.length > 0) {
            Intent intent = new Intent(context, SpendWiseBudgetWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, budgetIds);
            context.sendBroadcast(intent);
        }

        // 3. Update Quick Bar Widgets
        ComponentName quickName = new ComponentName(context, SpendWiseQuickBarWidget.class);
        int[] quickIds = manager.getAppWidgetIds(quickName);
        if (quickIds != null && quickIds.length > 0) {
            Intent intent = new Intent(context, SpendWiseQuickBarWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, quickIds);
            context.sendBroadcast(intent);
        }
    }
}
