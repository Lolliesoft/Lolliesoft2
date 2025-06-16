// src/Server/Data/BlogDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Lolliesoft2.Server.Models;

namespace Lolliesoft2.Server.Data
{
    public class BlogDbContext : IdentityDbContext<ApplicationUser>
    {
        public BlogDbContext(DbContextOptions<BlogDbContext> options)
            : base(options)
        {
        }

        public DbSet<BlogPost> BlogPosts { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Convention will see BlogPost.AuthorId ↔ ApplicationUser.Id
            // If you want it required:
            builder.Entity<BlogPost>()
                   .Property(bp => bp.AuthorId)
                   .IsRequired();

            // Optional: to make the navigation one-to-many
            builder.Entity<BlogPost>()
                   .HasOne(bp => bp.Author)
                   .WithMany()            // or .WithMany(u => u.BlogPosts) if you add that nav
                   .HasForeignKey(bp => bp.AuthorId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
