using Microsoft.EntityFrameworkCore;
using NotepadControllerApp.Data;
using NotepadControllerApp.Models;
using NotepadControllerApp.NativeMethods;
using System.Diagnostics;

namespace NotepadControllerApp.Services
{
    public class WindowStateService
    {
        private readonly ApplicationDbContext _context;
        private readonly WindowManagerService _windowManagerService;

        public WindowStateService(ApplicationDbContext context, WindowManagerService windowManagerService)
        {
            _context = context;
            _windowManagerService = windowManagerService;
        }

        public async Task ActualizarPosicionYVentanaRealAsync(string ventanaId, int x, int y, string userId)
        {
            var ventana = await _context.WindowStates
                .FirstOrDefaultAsync(w => w.VentanaId == ventanaId && w.UserId == userId);

            if (ventana != null)
            {
                {
                    ventana.X = x;
                    ventana.Y = y;
                    await _context.SaveChangesAsync();

                    if (ventana.ProcessId.HasValue)
                    {
                        try
                        {
                            var process = Process.GetProcessById(ventana.ProcessId.Value);

                            if (process.MainWindowHandle != IntPtr.Zero)
                            {
                                var width = Math.Max(ventana.Width, 300);
                                var height = Math.Max(ventana.Height, 200);

                                int borderCompensationWidth = 20;
                                int borderCompensationHeight = 20;

                                int adjustedWidth = width - borderCompensationWidth;
                                int adjustedHeight = height - borderCompensationHeight;

                                NativeMethodsHelper.MoveWindow(
                                    process.MainWindowHandle,
                                    ventana.X,
                                    ventana.Y,
                                    adjustedWidth,
                                    adjustedHeight,
                                    true
                                );
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error al mover ventana real {ventanaId}: {ex.Message}");
                        }
                    }
                }
            }
            else
            {
                ventana = new WindowState
                {
                    VentanaId = ventanaId,
                    X = x,
                    Y = y,
                    Width = 300, // Default size
                    Height = 200,
                    UserId = userId
                };
                _context.WindowStates.Add(ventana);
            }

            await _context.SaveChangesAsync();
        }

        public async Task ActualizarTamañoYVentanaRealAsync(string ventanaId, int width, int height, string userId)
        {
            var ventana = await _context.WindowStates
                .FirstOrDefaultAsync(w => w.VentanaId == ventanaId && w.UserId == userId);

            if (ventana != null)
            {
                ventana.Width = width;
                ventana.Height = height;
                await _context.SaveChangesAsync();

                if (ventana.ProcessId.HasValue)
                {
                    try
                    {
                        var process = Process.GetProcessById(ventana.ProcessId.Value);

                        if (process.MainWindowHandle != IntPtr.Zero)
                        {
                            width = Math.Max(width, 300);
                            height = Math.Max(height, 200);

                            int borderCompensationWidth = 20;  
                            int borderCompensationHeight = 20;

                            int adjustedWidth = width - borderCompensationWidth;
                            int adjustedHeight = height - borderCompensationHeight;

                            NativeMethodsHelper.MoveWindow(
                                process.MainWindowHandle,
                                ventana.X,
                                ventana.Y,
                                adjustedWidth,
                                adjustedHeight,
                                true
                            );
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al redimensionar ventana real {ventanaId}: {ex.Message}");
                    }
                }
            }
        }

        public async Task CerrarVentanaAsync(string ventanaId, string userId)
        {
            var ventana = await _context.WindowStates
                .FirstOrDefaultAsync(w => w.VentanaId == ventanaId && w.UserId == userId);

            if (ventana != null)
            {
                ventana.IsClosed = true;

                if (ventana.ProcessId.HasValue)
                {
                    _windowManagerService.CloseNotepad(ventana.ProcessId.Value);
                }

                await _context.SaveChangesAsync();
            }
        }

    }
}
