using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.UI;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.Web.WebView2.Core;
using Windows.ApplicationModel;
using Windows.Graphics;

namespace KAJ;

// One window: the game (Game\index.html, built from the web code) inside WebView2, like the
// Android app's WebView. The file is served from the package on a fixed https address, so the
// game works offline and its saved games (localStorage) stay in one place: the package's own
// folder, which Windows deletes when the app is uninstalled.
public sealed class GameWindow : Window
{
    private const string Host = "kaj.example";
    private const string StartUrl = "https://" + Host + "/index.html";
    // The game's background colour (style.css), shown while the game loads.
    private static readonly Windows.UI.Color Background = ColorHelper.FromArgb(255, 0x0a, 0x3a, 0x40);
    // The layout was made for about 820 × 430 (main.ts, applyZoom); smaller windows get cramped.
    private const int MinWidth = 800, MinHeight = 480;
    private const int StartWidth = 1280, StartHeight = 720;

    private readonly WebView2 web = new();
    private readonly OverlappedPresenter windowed = OverlappedPresenter.Create();

    public GameWindow()
    {
        Title = "Kris Ann's Journey";
        Content = new Grid { Background = new SolidColorBrush(Background), Children = { web } };
        PlaceWindow();
        _ = ShowGameAsync();
    }

    [DllImport("user32.dll")]
    private static extern uint GetDpiForWindow(IntPtr hwnd);

    // Opens at 1280 × 720 (or the screen, if smaller), centred, with a minimum size.
    private void PlaceWindow()
    {
        double scale = GetDpiForWindow(WinRT.Interop.WindowNative.GetWindowHandle(this)) / 96.0;
        windowed.PreferredMinimumWidth = (int)(MinWidth * scale);
        windowed.PreferredMinimumHeight = (int)(MinHeight * scale);
        AppWindow.SetPresenter(windowed);
        RectInt32 area = DisplayArea.GetFromWindowId(AppWindow.Id, DisplayAreaFallback.Primary).WorkArea;
        int w = Math.Min((int)(StartWidth * scale), area.Width);
        int h = Math.Min((int)(StartHeight * scale), area.Height);
        AppWindow.MoveAndResize(new RectInt32(area.X + (area.Width - w) / 2, area.Y + (area.Height - h) / 2, w, h));
    }

    private async Task ShowGameAsync()
    {
        try
        {
            // Empty, or an error, when the WebView2 Runtime is missing (a few Windows 10 PCs).
            if (string.IsNullOrEmpty(CoreWebView2Environment.GetAvailableBrowserVersionString()))
            {
                ShowMissingRuntime();
                return;
            }
            web.DefaultBackgroundColor = Background;
            await web.EnsureCoreWebView2Async();
        }
        catch (Exception)
        {
            ShowMissingRuntime();
            return;
        }

        CoreWebView2 core = web.CoreWebView2;
        // A game, not a browser: no right-click menu, zoom, reload (F5), find, print or developer tools.
        CoreWebView2Settings settings = core.Settings;
        settings.AreDefaultContextMenusEnabled = false;
        settings.AreDevToolsEnabled = false;
        settings.AreBrowserAcceleratorKeysEnabled = false;
        settings.IsZoomControlEnabled = false;
        settings.IsPinchZoomEnabled = false;
        settings.IsSwipeNavigationEnabled = false;
        settings.IsStatusBarEnabled = false;
        settings.IsGeneralAutofillEnabled = false;
        settings.IsPasswordAutosaveEnabled = false;
        settings.AreHostObjectsAllowed = false;

        core.SetVirtualHostNameToFolderMapping(Host,
            Path.Combine(Package.Current.InstalledLocation.Path, "Game"),
            CoreWebView2HostResourceAccessKind.Deny);
        // The game never leaves its own file; nothing else opens.
        core.NavigationStarting += (_, e) =>
        {
            if (!e.Uri.StartsWith("https://" + Host + "/", StringComparison.OrdinalIgnoreCase)) e.Cancel = true;
        };
        core.NewWindowRequested += (_, e) => e.Handled = true;
        core.WebMessageReceived += (_, e) => OnGameMessage(e.TryGetWebMessageAsString());
        // The web engine stopped (low memory or a crash): open the game again. The start screen
        // then offers to continue the saved game.
        core.ProcessFailed += (_, e) =>
        {
            if (e.ProcessFailedKind == CoreWebView2ProcessFailedKind.RenderProcessExited
                || e.ProcessFailedKind == CoreWebView2ProcessFailedKind.RenderProcessUnresponsive)
            {
                core.Navigate(StartUrl);
            }
        };
        core.Navigate(StartUrl);
    }

    // Messages from the game (main.ts, windowsApp): "leave" closes the app, "fullscreen" is F11.
    private void OnGameMessage(string message)
    {
        if (message == "leave")
        {
            Close();
        }
        else if (message == "fullscreen")
        {
            if (AppWindow.Presenter.Kind == AppWindowPresenterKind.FullScreen) AppWindow.SetPresenter(windowed);
            else AppWindow.SetPresenter(FullScreenPresenter.Create());
        }
    }

    private void ShowMissingRuntime()
    {
        Content = new Grid
        {
            Background = new SolidColorBrush(Background),
            Children =
            {
                new TextBlock
                {
                    Text = "Kris Ann's Journey needs the Microsoft Edge WebView2 Runtime, which this PC does not have.\n\n"
                        + "Please install it from Microsoft's page:\n"
                        + "https://developer.microsoft.com/microsoft-edge/webview2/consumer/\n\n"
                        + "Then open the game again.",
                    Foreground = new SolidColorBrush(Colors.White),
                    FontSize = 18,
                    TextWrapping = TextWrapping.Wrap,
                    IsTextSelectionEnabled = true,
                    TextAlignment = TextAlignment.Center,
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center,
                    Margin = new Thickness(32),
                },
            },
        };
    }
}
