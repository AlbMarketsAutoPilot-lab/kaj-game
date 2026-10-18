using Microsoft.UI.Dispatching;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;

namespace KAJ;

public partial class App : Application
{
    private static GameWindow? window;
    private static DispatcherQueue? queue;

    public App()
    {
        InitializeComponent();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        queue = DispatcherQueue.GetForCurrentThread();
        window = new GameWindow();
        window.Activate();
    }

    // The game was started again (Program.cs): show the window that is already open.
    public static void ShowWindow()
    {
        queue?.TryEnqueue(() =>
        {
            if (window == null) return;
            if (window.AppWindow.Presenter is OverlappedPresenter p && p.State == OverlappedPresenterState.Minimized) p.Restore();
            window.Activate();
        });
    }
}
