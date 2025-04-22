using System.Diagnostics;

namespace NotepadControllerApp.Services
{
    public class WindowManagerService
    {
        private readonly Dictionary<int, Process> _windows = new();

        public int StartNewNotepad()
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "mspaint.exe",
                    UseShellExecute = false,
                    RedirectStandardOutput = false,
                    RedirectStandardError = false,
                    RedirectStandardInput = false
                }
            };

            process.Start();

            int id = process.Id;
            _windows[id] = process;

            return id;
        }

        public void CloseNotepad(int id)
        {
            if (_windows.TryGetValue(id, out var process))
            {
                try
                {
                    process.Kill();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al intentar cerrar el proceso {id}: {ex.Message}");
                }
                finally
                {
                    _windows.Remove(id);
                }
            }
            else
            {
                try
                {
                    // Si no esta en _windows, intento encontrarlo directamente en Windows
                    var proc = Process.GetProcessById(id);
                    if (proc != null)
                    {
                        proc.Kill();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al intentar cerrar el proceso {id} (externo): {ex.Message}");
                }
            }
        }

        public IEnumerable<int> ListOpenNotepads()
        {
            return _windows.Keys;
        }
    }
}
