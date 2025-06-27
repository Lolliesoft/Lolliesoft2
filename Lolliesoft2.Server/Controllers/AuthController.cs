// Controllers/AuthController.cs
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.Tasks;
using Lolliesoft2.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace Lolliesoft2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _users;
        private readonly SignInManager<ApplicationUser> _signIn;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> users,
            SignInManager<ApplicationUser> signIn,
            IConfiguration config)
        {
            _users = users;
            _signIn = signIn;
            _config = config;
        }

        // POST api/auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email
            };

            var result = await _users.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Issue JWT immediately so the client is "logged in"
            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        // POST api/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var user = await _users.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid credentials." });

            var signInRes = await _signIn.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!signInRes.Succeeded)
                return Unauthorized(new { error = "Invalid credentials." });

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Shared JWT generation
        private string GenerateJwtToken(ApplicationUser user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub,         user.Id),
                new Claim(JwtRegisteredClaimNames.UniqueName,  user.UserName!),
                new Claim(JwtRegisteredClaimNames.Email,       user.Email!)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }

        // DTOs
        public class RegisterDto
        {
            [Required, MaxLength(100)]
            public string UserName { get; set; } = null!;

            [Required, EmailAddress]
            public string Email { get; set; } = null!;

            [Required, MinLength(6)]
            public string Password { get; set; } = null!;
        }

        public class LoginDto
        {
            [Required, EmailAddress]
            public string Email { get; set; } = null!;

            [Required]
            public string Password { get; set; } = null!;
        }
    }
}
