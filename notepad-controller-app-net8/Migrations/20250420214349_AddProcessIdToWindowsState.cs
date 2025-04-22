using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotepadControllerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddProcessIdToWindowsState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProcessId",
                table: "WindowStates",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcessId",
                table: "WindowStates");
        }
    }
}
