using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NotepadControllerApp.Services;
using System.Security.Claims;

namespace NotepadControllerApp.Hubs
{
    [Authorize]
    public class ControlHub : Hub
    {
        private readonly WindowStateService _windowStateService;

        public ControlHub(WindowStateService windowStateService)
        {
            _windowStateService = windowStateService;
        }

        public async Task EnviarPosicion(string ventanaId, int x, int y)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                await _windowStateService.ActualizarPosicionYVentanaRealAsync(ventanaId, x, y, userId);
            }

            await Clients.Others.SendAsync("ActualizarPosicion", ventanaId, x, y);
        }

        public async Task Redimensionar(string ventanaId, int width, int height)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                await _windowStateService.ActualizarTamañoYVentanaRealAsync(ventanaId, width, height, userId);
            }

            await Clients.Others.SendAsync("ActualizarTamaño", ventanaId, width, height);
        }

        public async Task Cerrar(string ventanaId)
        {
            var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                await _windowStateService.CerrarVentanaAsync(ventanaId, userId);
            }

            await Clients.Caller.SendAsync("CerrarVentana", ventanaId);
        }


    }
}
