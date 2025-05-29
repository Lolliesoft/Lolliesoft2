using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
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
                .Where(b => !b.IsPrivate)
                .OrderByDescending(b => b.Created)
                .ToListAsync();
            return Ok(posts);
        }

        // GET api/blog/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var post = await _db.BlogPosts.FindAsync(id);
            if (post == null || post.IsPrivate)
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

            var post = new BlogPost
            {
                Title = dto.Title,
                Content = dto.Content,
                IsPrivate = dto.IsPrivate
            };

            if (dto.Image != null && dto.Image.Length > 0)
            {
                // Validate file
                var ext = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                if (!PERMITTED_EXTENSIONS.Contains(ext))
                    return BadRequest(new { error = "Only JPG, JPEG, PNG, or GIF images are allowed." });

                if (dto.Image.Length > MAX_FILE_SIZE)
                    return BadRequest(new { error = "File size exceeds 15 MB limit." });

                if (!dto.Image.ContentType.StartsWith("image/"))
                    return BadRequest(new { error = "Invalid file content type." });

                // Slugify filename and append timestamp
                string Slugify(string text) =>
                    Regex.Replace(text.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

                var originalName = Path.GetFileNameWithoutExtension(dto.Image.FileName);
                var slug = Slugify(originalName);
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var fileName = $"{slug}-{timestamp}{ext}";

                var uploads = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploads);

                var filePath = Path.Combine(uploads, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                post.ImagePath = $"/uploads/{fileName}";
            }

            _db.BlogPosts.Add(post);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = post.Id }, post);
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

            post.Title = dto.Title;
            post.Content = dto.Content;
            post.IsPrivate = dto.IsPrivate;
            post.Updated = DateTime.UtcNow;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                // Validate file
                var ext = Path.GetExtension(dto.Image.FileName).ToLowerInvariant();
                if (!PERMITTED_EXTENSIONS.Contains(ext))
                    return BadRequest(new { error = "Only JPG, JPEG, PNG, or GIF images are allowed." });

                if (dto.Image.Length > MAX_FILE_SIZE)
                    return BadRequest(new { error = "File size exceeds 15 MB limit." });

                if (!dto.Image.ContentType.StartsWith("image/"))
                    return BadRequest(new { error = "Invalid file content type." });

                // Slugify filename and append timestamp
                string Slugify(string text) =>
                    Regex.Replace(text.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

                var originalName = Path.GetFileNameWithoutExtension(dto.Image.FileName);
                var slug = Slugify(originalName);
                var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
                var fileName = $"{slug}-{timestamp}{ext}";

                var uploads = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploads);

                var filePath = Path.Combine(uploads, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
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

            _db.BlogPosts.Remove(post);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}