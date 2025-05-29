using System.ComponentModel.DataAnnotations;

namespace Lolliesoft2.Server.Models
{
    public class BlogPost
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public string? ImagePath { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime? Updated { get; set; }
    }
}
