using Microsoft.EntityFrameworkCore;
using StockService.Models;

namespace StockService.Data
{
    public class StockDbContext : DbContext
    {
        public StockDbContext(DbContextOptions options) : base(options) 
        {
            
        }

        public DbSet<Stock> Stocks { get; set; }
        public DbSet<Comment> Comments { get; set; }

    }
}
