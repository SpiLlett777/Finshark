using Microsoft.EntityFrameworkCore;
using PortfolioService.Models;

namespace PortfolioService.Data
{
    public class PortfolioDbContext : DbContext
    {
        public PortfolioDbContext(DbContextOptions options) : base(options)
        {
            
        }

        public DbSet<Portfolio> Portfolios { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Portfolio>()
                .HasKey(p => new { p.StockId, p.AppUserId });
            
            builder.Entity<Portfolio>()
                .HasIndex(p => p.AppUserId);
        }
    }
}
