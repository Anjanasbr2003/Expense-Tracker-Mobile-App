package com.spendwise.expensetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class SpendWiseBudgetWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetDataHelper.PREFS_NAME, Context.MODE_PRIVATE);
        float monthSpent = prefs.getFloat(WidgetDataHelper.KEY_MONTH_SPENT, 0.0f);
        float monthlyBudget = prefs.getFloat(WidgetDataHelper.KEY_MONTHLY_BUDGET, 50000.0f);
        String currency = prefs.getString(WidgetDataHelper.KEY_CURRENCY, "Rs.");

        double remaining = monthlyBudget - monthSpent;
        int pctUsed = monthlyBudget > 0 ? (int) Math.round((monthSpent / monthlyBudget) * 100) : 0;

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_budget);

        views.setTextViewText(R.id.widget_budget_remaining, WidgetDataHelper.formatCurrency(remaining, currency));
        views.setTextViewText(R.id.widget_budget_month_spent, "Spent: " + WidgetDataHelper.formatCurrency(monthSpent, currency));
        
        float weeklyRemaining = prefs.getFloat(WidgetDataHelper.KEY_WEEKLY_REMAINING, 0.0f);
        views.setTextViewText(R.id.widget_budget_weekly_remaining, "Weekly Left: " + WidgetDataHelper.formatCurrency(weeklyRemaining, currency));

        String statusText;
        if (remaining < 0) {
            statusText = "OVER BUDGET • " + pctUsed + "% USED";
            views.setTextColor(R.id.widget_budget_remaining, 0xFFFB7185); // Rose
        } else if (pctUsed >= 80) {
            statusText = "CAUTION • " + pctUsed + "% USED";
            views.setTextColor(R.id.widget_budget_remaining, 0xFFFBBF24); // Amber
        } else {
            statusText = "SAFE • " + (100 - pctUsed) + "% REMAINING";
            views.setTextColor(R.id.widget_budget_remaining, 0xFFFFFFFF); // White
        }
        views.setTextViewText(R.id.widget_budget_status_text, statusText);

        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                10,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_budget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
