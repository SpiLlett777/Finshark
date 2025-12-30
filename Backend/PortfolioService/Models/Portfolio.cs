using System.ComponentModel.DataAnnotations.Schema;

namespace PortfolioService.Models
{
    [Table("Portfolios")]
    public class Portfolio
    {
        public string AppUserId { get; set; } = string.Empty;
        public int StockId { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
