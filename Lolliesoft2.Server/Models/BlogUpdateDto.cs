using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Lolliesoft2.Server.Models
{
    public class BlogUpdateDto
    {
        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public bool IsPrivate { get; set; }

        public IFormFile? Image { get; set; }
    }
}