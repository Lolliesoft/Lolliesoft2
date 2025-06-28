using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lolliesoft2.Server.Models;

namespace Lolliesoft2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // GET: api/admin/users
        // List all users with their roles
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = _userManager.Users.ToList();
            var result = new List<UserRolesDto>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new UserRolesDto
                {
                    UserId = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    Roles = roles.ToList()
                });
            }
            return Ok(result);
        }

        // GET: api/admin/roles
        // List all roles
        [HttpGet("roles")]
        public IActionResult GetRoles()
        {
            var roles = _roleManager.Roles.Select(r => r.Name).ToList();
            return Ok(roles);
        }

        // POST: api/admin/roles
        // Create a new role
        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto dto)
        {
            if (await _roleManager.RoleExistsAsync(dto.RoleName))
                return Conflict(new { error = "Role already exists." });

            var result = await _roleManager.CreateAsync(new IdentityRole(dto.RoleName));
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Role created." });
        }

        // DELETE: api/admin/roles/{roleName}
        // Delete an existing role
        [HttpDelete("roles/{roleName}")]
        public async Task<IActionResult> DeleteRole(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
                return NotFound(new { error = "Role not found." });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        // POST: api/admin/users/{userId}/roles
        // Assign roles to a user
        [HttpPost("users/{userId}/roles")]
        public async Task<IActionResult> AddUserRoles(string userId, [FromBody] ManageUserRolesDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { error = "User not found." });

            var validRoles = dto.Roles.Where(r => _roleManager.RoleExistsAsync(r).Result).ToArray();
            var result = await _userManager.AddToRolesAsync(user, validRoles);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Roles added." });
        }

        // DELETE: api/admin/users/{userId}/roles
        // Remove roles from a user
        [HttpDelete("users/{userId}/roles")]
        public async Task<IActionResult> RemoveUserRoles(string userId, [FromBody] ManageUserRolesDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { error = "User not found." });

            var result = await _userManager.RemoveFromRolesAsync(user, dto.Roles);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Roles removed." });
        }
    }

    // DTOs for AdminController
    public class UserRolesDto
    {
        public string UserId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class RoleDto
    {
        public string RoleName { get; set; } = null!;
    }

    public class ManageUserRolesDto
    {
        public List<string> Roles { get; set; } = new List<string>();
    }
}
