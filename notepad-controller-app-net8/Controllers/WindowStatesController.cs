using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotepadControllerApp.Data;
using NotepadControllerApp.Models;
using NotepadControllerApp.Services;
using System.Diagnostics;
using System.Security.Claims;

namespace NotepadControllerApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WindowStatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly WindowManagerService _windowManagerService;

        public WindowStatesController(ApplicationDbContext context, WindowManagerService windowManagerService)
        {
            _context = context;
            _windowManagerService = windowManagerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWindows([FromQuery] bool crearSiNoExiste = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var ventanas = _context.WindowStates
                .Where(w => w.UserId == userId && !w.IsClosed)
                .ToList();

            if (!ventanas.Any() && crearSiNoExiste)
            {
                for (int i = 0; i < 2; i++)
                {
                    var processId = _windowManagerService.StartNewNotepad();

                    var newWindow = new WindowState
                    {
                        VentanaId = Guid.NewGuid().ToString(),
                        UserId = userId,
                        X = 50 + (i * 400),
                        Y = 50,
                        Width = 300,
                        Height = 200,
                        IsClosed = false,
                        ProcessId = processId
                    };

                    _context.WindowStates.Add(newWindow);
                    ventanas.Add(newWindow);
                }

                await _context.SaveChangesAsync();
            }

            foreach (var window in ventanas)
            {
                if (window.ProcessId.HasValue && !IsProcessAlive(window.ProcessId.Value))
                {
                    var newProcessId = _windowManagerService.StartNewNotepad();
                    window.ProcessId = newProcessId;
                }
            }

            await _context.SaveChangesAsync();

            var resultado = ventanas.Select(w => new
            {
                w.VentanaId,
                w.X,
                w.Y,
                w.Width,
                w.Height
            }).ToList();

            return Ok(resultado);
        }

        [HttpPost("iniciar")]
        public async Task<IActionResult> IniciarVentana([FromQuery] string ventanaId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var window = await _context.WindowStates
                .FirstOrDefaultAsync(w => w.VentanaId == ventanaId && w.UserId == userId);

            if (window == null)
                return NotFound();

            var processId = _windowManagerService.StartNewNotepad();

            window.ProcessId = processId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ventana iniciada correctamente.", processId });
        }

        private bool IsProcessAlive(int processId)
        {
            try
            {
                var proc = Process.GetProcessById(processId);
                return !proc.HasExited;
            }
            catch
            {
                return false;
            }
        }
    }
}
