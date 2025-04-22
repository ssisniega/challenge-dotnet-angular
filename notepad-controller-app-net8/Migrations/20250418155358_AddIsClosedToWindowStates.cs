using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NotepadControllerApp.Migrations
{
    /// <inheritdoc />
    public partial class AddIsClosedToWindowStates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsClosed",
                table: "WindowStates",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsClosed",
                table: "WindowStates");
        }
    }
}
