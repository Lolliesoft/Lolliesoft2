using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Lolliesoft2.Server.Models
{
    public class BlogCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; }

    [Required, MinLength(20)]
    public string Content { get; set; }

    /// <summary> Only Owner can see when true. </summary>
    public bool IsPrivate { get; set; }

    /// <summary>
    /// Optional hero image. Only JPG/PNG/GIF and ≤5 MB allowed.
    /// </summary>
    public IFormFile? Image { get; set; }
}

}