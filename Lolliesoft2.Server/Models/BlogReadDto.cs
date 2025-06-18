// src/Lolliesoft2.Server/Models/BlogReadDto.cs
using System.ComponentModel.DataAnnotations;

namespace Lolliesoft2.Server.Models
{
    public class BlogReadDto
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Content { get; set; } = null!;

        public string? ImagePath { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime Created { get; set; }
        public DateTime? Updated { get; set; }

        // Add these two:
        public string AuthorId { get; set; } = null!;
        public string AuthorName { get; set; } = null!;
    }
}
