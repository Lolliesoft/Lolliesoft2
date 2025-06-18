// Controllers/BlogController.cs
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Lolliesoft2.Server.Data;
using Lolliesoft2.Server.Models;

namespace Lolliesoft2.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogController : ControllerBase
    {
        private readonly BlogDbContext _db;
        private readonly IWebHostEnvironment _env;

        private static readonly string[] PERMITTED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif" };
        private const long MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

        public BlogController(BlogDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // GET api/blog
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _db.BlogPosts
                .Include(b => b.Author)
                .Where(b => !b.IsPrivate)
                .OrderByDescending(b => b.Created)
                .Select(b => new BlogReadDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Content = b.Content,
                    ImagePath = b.ImagePath,
                    IsPrivate = b.IsPrivate,
                    Created = b.Created,
                    Updated = b.Updated,
                    AuthorId = b.AuthorId,
                    AuthorName = b.Author.UserName
                })
                .ToListAsync();

            return Ok(posts);
        }

        // GET api/blog/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var post = await _db.BlogPosts
                .Include(b => b.Author)
                .Where(b => b.Id == id && !b.IsPrivate)
                .Select(b => new BlogReadDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Content = b.Content,
                    ImagePath = b.ImagePath,
                    IsPrivate = b.IsPrivate,
                    Created = b.Created,
                    Updated = b.Updated,
                    AuthorId = b.AuthorId,
                    AuthorName = b.Author.UserName
                })
                .FirstOrDefaultAsync();

            if (post == null)
                return NotFound(new { error = "Blog post not found." });

            return Ok(post);
        }

        // POST api/blog
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] BlogCreateDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue("sub")
                           ?? throw new UnauthorizedAccessException();

            var post = new BlogPost
            {
                Title = dto.Title,
                Content = dto.Content,
                IsPrivate = dto.IsPrivate,
                Created = DateTime.UtcNow,
                AuthorId = authorId
            };

            // file‐upload handling (unchanged)…
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var ext = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                if (!PERMITTED_EXTENSIONS.Contains(ext))
                    return BadRequest(new { error = "Only JPG, JPEG, PNG, or GIF images are allowed." });
                if (dto.Image.Length > MAX_FILE_SIZE)
                    return BadRequest(new { error = "File size exceeds 15 MB limit." });
                if (!dto.Image.ContentType.StartsWith("image/"))
                    return BadRequest(new { error = "Invalid file content type." });

                string Slugify(string text) =>
                    Regex.Replace(text.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

                var originalName = Path.GetFileNameWithoutExtension(dto.Image.FileName);
                var slug = Slugify(originalName);
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var fileName = $"{slug}-{timestamp}{ext}";

                var uploads = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploads);
                var filePath = Path.Combine(uploads, fileName);
                await using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                post.ImagePath = $"/uploads/{fileName}";
            }

            _db.BlogPosts.Add(post);
            await _db.SaveChangesAsync();

            // return the read‐DTO
            var resultDto = new BlogReadDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                ImagePath = post.ImagePath,
                IsPrivate = post.IsPrivate,
                Created = post.Created,
                Updated = post.Updated,
                AuthorId = post.AuthorId,
                AuthorName = User.Identity?.Name ?? ""
            };

            return CreatedAtAction(nameof(Get), new { id = post.Id }, resultDto);
        }

        // PUT api/blog/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] BlogUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var post = await _db.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound(new { error = "Blog post not found." });

            var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("sub");
            if (post.AuthorId != authorId)
                return Forbid();

            post.Title = dto.Title;
            post.Content = dto.Content;
            post.IsPrivate = dto.IsPrivate;
            post.Updated = DateTime.UtcNow;

            // optional new image handling …
            if (dto.Image != null && dto.Image.Length > 0)
            {
                // same file‐upload logic as above…
                var ext = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                if (!PERMITTED_EXTENSIONS.Contains(ext))
                    return BadRequest(new { error = "Only JPG, JPEG, PNG, or GIF images are allowed." });
                if (dto.Image.Length > MAX_FILE_SIZE)
                    return BadRequest(new { error = "File size exceeds 15 MB limit." });
                if (!dto.Image.ContentType.StartsWith("image/"))
                    return BadRequest(new { error = "Invalid file content type." });

                string Slugify(string text) =>
                    Regex.Replace(text.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

                var originalName = Path.GetFileNameWithoutExtension(dto.Image.FileName);
                var slug = Slugify(originalName);
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var fileName = $"{slug}-{timestamp}{ext}";

                var uploads = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploads);
                var filePath = Path.Combine(uploads, fileName);
                await using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                post.ImagePath = $"/uploads/{fileName}";
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/blog/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var post = await _db.BlogPosts.FindAsync(id);
            if (post == null)
                return NotFound(new { error = "Blog post not found." });

            var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("sub");
            if (post.AuthorId != authorId)
                return Forbid();

            _db.BlogPosts.Remove(post);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
