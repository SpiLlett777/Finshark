namespace Shared.Dtos.Portfolio
{
    public class UpdatePortfolioDto
    {
        public string Symbol { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
