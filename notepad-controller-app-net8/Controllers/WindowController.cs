using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotepadControllerApp.Services;

namespace NotepadControllerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DummyWindowController : ControllerBase
    {
        private readonly WindowManagerService _windowManagerService;

        public DummyWindowController(WindowManagerService windowManagerService)
        {
            _windowManagerService = windowManagerService;
        }

        [HttpPost("start")]
        public IActionResult StartDummyApp()
        {
            var id = _windowManagerService.StartNewNotepad();
            return Ok(new { Id = id });
        }

        [HttpPost("close/{id}")]
        public IActionResult CloseDummyApp(int id)
        {
            _windowManagerService.CloseNotepad(id);
            return Ok();
        }
    }
}
