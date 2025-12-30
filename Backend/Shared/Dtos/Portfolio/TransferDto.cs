namespace Shared.Dtos.Portfolio
{
    public class TransferDto
    {
        public string Symbol { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string ToUser { get; set; } = string.Empty;
    }
}
