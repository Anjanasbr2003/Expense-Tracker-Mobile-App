package com.spendwise.expensetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class SpendWiseGlanceWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetDataHelper.PREFS_NAME, Context.MODE_PRIVATE);
        float todaySpent = prefs.getFloat(WidgetDataHelper.KEY_TODAY_SPENT, 0.0f);
        float monthSpent = prefs.getFloat(WidgetDataHelper.KEY_MONTH_SPENT, 0.0f);
        String currency = prefs.getString(WidgetDataHelper.KEY_CURRENCY, "Rs.");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_glance);

        SimpleDateFormat sdf = new SimpleDateFormat("MMM d", Locale.US);
        views.setTextViewText(R.id.widget_glance_date, sdf.format(new Date()).toUpperCase());

        views.setTextViewText(R.id.widget_glance_today, WidgetDataHelper.formatCurrency(todaySpent, currency));
        views.setTextViewText(R.id.widget_glance_month, WidgetDataHelper.formatCurrency(monthSpent, currency));

        // Click Root -> Open App
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainPending = PendingIntent.getActivity(
                context,
                0,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_glance_root, mainPending);

        // Click Quick Add -> Open App with add trigger
        Intent addIntent = new Intent(context, MainActivity.class);
        addIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        addIntent.putExtra("shortcut_action", "add");
        PendingIntent addPending = PendingIntent.getActivity(
                context,
                1,
                addIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_glance_btn_add, addPending);

        // Click History -> Open App with history trigger
        Intent historyIntent = new Intent(context, MainActivity.class);
        historyIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        historyIntent.putExtra("shortcut_action", "history");
        PendingIntent historyPending = PendingIntent.getActivity(
                context,
                2,
                historyIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_glance_btn_history, historyPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
