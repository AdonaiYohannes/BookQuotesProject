using BookQuotes.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookQuotes.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        // Sätt till true om du vill göra e-post unik i databasen
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique(false);
    }
}
