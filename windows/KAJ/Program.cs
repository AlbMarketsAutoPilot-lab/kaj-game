using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Dispatching;
using Microsoft.Windows.AppLifecycle;

namespace KAJ;

// The game opens only once: starting it again brings the open window to the front, so two
// windows never overwrite each other's saved game. Made like Microsoft's sample
// "How to create a single-instanced WinUI app with C#" (needs DISABLE_XAML_GENERATED_MAIN).
public static class Program
{
    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [STAThread]
    private static int Main(string[] args)
    {
        WinRT.ComWrappersSupport.InitializeComWrappers();
        AppInstance main = AppInstance.FindOrRegisterForKey("KAJ");
        if (!main.IsCurrent)
        {
            AppActivationArguments activation = AppInstance.GetCurrent().GetActivatedEventArgs();
            Task.Run(() => main.RedirectActivationToAsync(activation).AsTask()).Wait();
            SetForegroundWindow(Process.GetProcessById((int)main.ProcessId).MainWindowHandle);
            return 0;
        }
        main.Activated += (_, _) => App.ShowWindow();
        Microsoft.UI.Xaml.Application.Start(p =>
        {
            SynchronizationContext.SetSynchronizationContext(
                new DispatcherQueueSynchronizationContext(DispatcherQueue.GetForCurrentThread()));
            _ = new App();
        });
        return 0;
    }
}
