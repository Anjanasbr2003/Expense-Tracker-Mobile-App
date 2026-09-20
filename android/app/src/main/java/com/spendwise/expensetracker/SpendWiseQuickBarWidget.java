package com.spendwise.expensetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class SpendWiseQuickBarWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetDataHelper.PREFS_NAME, Context.MODE_PRIVATE);
        float todaySpent = prefs.getFloat(WidgetDataHelper.KEY_TODAY_SPENT, 0.0f);
        String currency = prefs.getString(WidgetDataHelper.KEY_CURRENCY, "Rs.");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quick_bar);

        views.setTextViewText(R.id.widget_quick_today, WidgetDataHelper.formatCurrency(todaySpent, currency));

        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainPending = PendingIntent.getActivity(
                context,
                20,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quick_root, mainPending);

        Intent addIntent = new Intent(context, MainActivity.class);
        addIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        addIntent.putExtra("shortcut_action", "add");
        PendingIntent addPending = PendingIntent.getActivity(
                context,
                21,
                addIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quick_btn_add, addPending);

        Intent foodIntent = new Intent(context, MainActivity.class);
        foodIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        foodIntent.putExtra("shortcut_action", "add_food");
        PendingIntent foodPending = PendingIntent.getActivity(
                context,
                22,
                foodIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quick_btn_food, foodPending);

        Intent transportIntent = new Intent(context, MainActivity.class);
        transportIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        transportIntent.putExtra("shortcut_action", "add_transport");
        PendingIntent transportPending = PendingIntent.getActivity(
                context,
                23,
                transportIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_quick_btn_transport, transportPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
