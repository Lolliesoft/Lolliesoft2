// Controllers/AuthController.cs
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Lolliesoft2.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

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

            // assign default "Reader" role
            await _users.AddToRoleAsync(user, "Reader");

            // fetch roles and issue JWT immediately
            var roles = await _users.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

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

            // fetch roles and issue JWT
            var roles = await _users.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

            return Ok(new { token });
        }

        // GET api/auth/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _users.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var roles = await _users.GetRolesAsync(user);
            return Ok(new
            {
                id = user.Id,
                name = user.UserName,
                email = user.Email,
                roles
            });
        }

        // Shared JWT generation, now accepts roles
        private string GenerateJwtToken(ApplicationUser user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
        {
            // very important: emit NameIdentifier so User.FindFirstValue(ClaimTypes.NameIdentifier) works
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!)
        };
            // emit one "role" claim per role:
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

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
