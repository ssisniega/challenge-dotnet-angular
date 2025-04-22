using NotepadControllerApp.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotepadControllerApp.Models
{
    public class WindowState
    {
        public int Id { get; set; }
        public string VentanaId { get; set; } = string.Empty;
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        // Relación con usuario
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public ApplicationUser? User { get; set; }

        public bool IsClosed { get; set; } = false;

        public int? ProcessId { get; set; }
    }
}
