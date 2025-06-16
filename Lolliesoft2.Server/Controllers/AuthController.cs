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

        // Allow anyone to register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
            var result = await _users.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "User created" });
        }

        // Allow anyone to login and get a JWT
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _users.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid credentials." });

            var signInRes = await _signIn.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!signInRes.Succeeded)
                return Unauthorized(new { error = "Invalid credentials." });

            // Build claims
            var claims = new[]
            {
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.UniqueName, user.UserName),
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            // Create signing credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Build the token
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            // Return the serialized token
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }
    }

    public class RegisterDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
