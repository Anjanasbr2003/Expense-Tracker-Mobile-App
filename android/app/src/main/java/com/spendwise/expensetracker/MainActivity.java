package com.spendwise.expensetracker;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.ViewCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFF000000);
        window.setNavigationBarColor(0xFF000000);

        // Fix Capacitor 8 insets stacking conflict and optimize WebView scrolling performance
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            getBridge().getWebView().setVerticalScrollBarEnabled(false);
            getBridge().getWebView().setHorizontalScrollBarEnabled(false);
            getBridge().getWebView().post(() -> {
                try {
                    View parent = (View) getBridge().getWebView().getParent();
                    if (parent != null) {
                        ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> {
                            v.setPadding(0, 0, 0, 0);
                            return insets;
                        });
                        getBridge().getWebView().requestApplyInsets();
                    }
                } catch (Exception ignored) {}
            });
        }
    }
}
