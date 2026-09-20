package com.spendwise.expensetracker;

import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Switch from launch/splash theme to main application theme
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);

        Window window = getWindow();

        // Ensure status bar and navigation bar are permanently visible (not hidden/fullscreen)
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFF030805); // Rich SpendWise dark emerald
        window.setNavigationBarColor(0xFF000000);
        // Set native window canvas background to SpendWise dark emerald (#030805)
        // This ensures keyboard resize transitions never expose a black void
        window.setBackgroundDrawable(new ColorDrawable(0xFF030805));

        // Ensure decor fits system windows so system status bar is visible above the WebView
        WindowCompat.setDecorFitsSystemWindows(window, true);

        // Explicitly show status bar via WindowInsetsController
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.show(WindowInsetsCompat.Type.statusBars());
            controller.show(WindowInsetsCompat.Type.navigationBars());
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_DEFAULT);
            // White status bar icons (battery, clock, wifi) against dark background
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

        // Configure WebView & Register Widget Sync Bridge
        if (getBridge() != null && getBridge().getWebView() != null) {
            // Set WebView canvas background to SpendWise emerald to prevent white open screen and black flash
            getBridge().getWebView().setBackgroundColor(0xFF030805);
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            getBridge().getWebView().setVerticalScrollBarEnabled(false);
            getBridge().getWebView().setHorizontalScrollBarEnabled(false);

            // Register native bridge for real-time widget data synchronization
            getBridge().getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void syncWidgetData(double todaySpent, double monthSpent, double monthlyBudget, String currencySymbol) {
                    WidgetDataHelper.saveMetrics(MainActivity.this, todaySpent, monthSpent, monthlyBudget, currencySymbol);
                }
            }, "SpendWiseWidgetBridge");

            // Handle incoming widget shortcut actions
            handleShortcutIntent(getIntent());
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShortcutIntent(intent);
    }

    private void handleShortcutIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getStringExtra("shortcut_action");
        if (action != null && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                String js = "if (window.dispatchEvent) { window.dispatchEvent(new CustomEvent('spendwise_widget_shortcut', { detail: { action: '" + action + "' } })); }";
                getBridge().getWebView().evaluateJavascript(js, null);
            });
        }
    }
}
