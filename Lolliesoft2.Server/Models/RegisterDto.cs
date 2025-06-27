﻿using System.ComponentModel.DataAnnotations;

namespace Lolliesoft2.Server.Models
{
    public class RegisterDto
    {
        [Required, MaxLength(100)]
        public string UserName { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Required, MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
