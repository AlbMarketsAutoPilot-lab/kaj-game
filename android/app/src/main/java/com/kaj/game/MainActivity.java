package com.kaj.game;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;

import androidx.webkit.WebViewAssetLoader;

import java.util.Locale;

// One screen: the game (assets/index.html, built from the web code) inside a WebView.
// Files are served from the APK on a fixed https address, so the game works offline
// and its saved games (localStorage) stay in one place.
// Only Android's own classes and androidx.webkit: nothing else to download (task 15).
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/assets/index.html";
    // The game's background colour (style.css), shown while the game loads (audit U1).
    private static final int BACKGROUND = Color.rgb(0x0a, 0x3a, 0x40);

    private WebViewAssetLoader loader;
    private WebView webView;
    // The camera cut-out in screen points (CSS px): the page keeps its buttons out of it (audit U2).
    private int cutLeft, cutTop, cutRight, cutBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Full screen (owner's request, task 14 B1): the game also uses the camera cut-out area.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = getWindow().getAttributes();
            attrs.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attrs);
        }
        showGame(savedInstanceState);
        hideSystemBars();

        // Back gesture on Android 13 and newer (audit C1); older versions call onBackPressed below.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::askToLeave);
        }
    }

    // Back button or back gesture: ask before leaving the game.
    private void askToLeave() {
        new AlertDialog.Builder(this)
                .setMessage("Leave the game?")
                .setPositiveButton("Leave", (d, w) -> finish())
                .setNegativeButton("Stay", null)
                .show();
    }

    // Android 12 and older (and 13 to 15 without the new back system).
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        askToLeave();
    }

    // Builds the web view and opens the game; again after the web engine was stopped (audit C2).
    // Reviewed (audit S1): the game needs JavaScript. It runs only its own file from the app, has no
    // text input and no bridge to the phone, and every other address is blocked.
    @SuppressLint("SetJavaScriptEnabled")
    private void showGame(Bundle savedInstanceState) {
        webView = new WebView(this);
        webView.setBackgroundColor(BACKGROUND);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebViewClient(new GameClient());
        webView.setOnApplyWindowInsetsListener((v, insets) -> {
            readCutout(insets);
            return v.onApplyWindowInsets(insets);
        });
        setContentView(webView);
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    private class GameClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return loader.shouldInterceptRequest(request.getUrl());
        }

        // The game never leaves the app.
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !HOST.equals(request.getUrl().getHost());
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            sendCutout();
        }

        // Android stopped the web engine (low memory or a crash): open the game again instead of
        // closing the app. The start screen then offers to continue the saved game.
        @Override
        @TargetApi(Build.VERSION_CODES.O)
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            if (view == webView) {
                removeWebView();
                showGame(null);
                hideSystemBars();
            }
            return true;
        }
    }

    private void removeWebView() {
        if (webView == null) return;
        if (webView.getParent() instanceof ViewGroup) ((ViewGroup) webView.getParent()).removeView(webView);
        webView.destroy();
        webView = null;
    }

    private void readCutout(WindowInsets insets) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return;
        DisplayCutout cut = insets.getDisplayCutout();
        float dp = getResources().getDisplayMetrics().density;
        int l = cut == null ? 0 : Math.round(cut.getSafeInsetLeft() / dp);
        int t = cut == null ? 0 : Math.round(cut.getSafeInsetTop() / dp);
        int r = cut == null ? 0 : Math.round(cut.getSafeInsetRight() / dp);
        int b = cut == null ? 0 : Math.round(cut.getSafeInsetBottom() / dp);
        if (l == cutLeft && t == cutTop && r == cutRight && b == cutBottom) return;
        cutLeft = l;
        cutTop = t;
        cutRight = r;
        cutBottom = b;
        sendCutout();
    }

    // Tells the page the size of the camera cut-out (style.css: --cut-l, --cut-t, --cut-r, --cut-b).
    private void sendCutout() {
        if (webView == null) return;
        webView.evaluateJavascript(String.format(Locale.ROOT,
                "(function(s){s.setProperty('--cut-l','%dpx');s.setProperty('--cut-t','%dpx');"
                        + "s.setProperty('--cut-r','%dpx');s.setProperty('--cut-b','%dpx');})"
                        + "(document.documentElement.style)",
                cutLeft, cutTop, cutRight, cutBottom), null);
    }

    // Clock, notifications and the back/home bar stay hidden; a swipe from the edge shows them
    // for a moment, then they hide again.
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController bars = getWindow().getInsetsController();
            if (bars != null) {
                bars.hide(WindowInsets.Type.systemBars());
                bars.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            hideSystemBarsBeforeAndroid11();
        }
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBarsBeforeAndroid11() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    // Leaving the app or locking the phone pauses the game page; the page then pauses its music
    // and sounds (audit C3).
    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        removeWebView();
        super.onDestroy();
    }
}
