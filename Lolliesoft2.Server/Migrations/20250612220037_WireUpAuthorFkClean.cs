using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lolliesoft2.Server.Migrations
{
    /// <inheritdoc />
    public partial class WireUpAuthorFkClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Backfill any missing or invalid AuthorId:
            migrationBuilder.Sql(@"
        UPDATE [BlogPosts]
        SET AuthorId = '4356442e-c749-45db-9197-e75d3fa20117'
        WHERE AuthorId IS NULL
           OR AuthorId = ''
           OR AuthorId NOT IN (SELECT [Id] FROM [AspNetUsers]);
    ");

            // 2) Now adjust the column and add your index/constraint:
            migrationBuilder.AlterColumn<string>(
                name: "AuthorId",
                table: "BlogPosts",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_AuthorId",
                table: "BlogPosts",
                column: "AuthorId");

            migrationBuilder.AddForeignKey(
                name: "FK_BlogPosts_AspNetUsers_AuthorId",
                table: "BlogPosts",
                column: "AuthorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
