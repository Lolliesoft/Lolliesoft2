// src/Lolliesoft2.Server/Models/BlogPost.cs

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lolliesoft2.Server.Models
{
    public class BlogPost
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Content { get; set; } = null!;

        public string? ImagePath { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime? Updated { get; set; }

        // the FK and navigation for Author
        [Required, ForeignKey(nameof(Author))]
        public string AuthorId { get; set; } = null!;
        public ApplicationUser Author { get; set; } = null!;
    }
}
