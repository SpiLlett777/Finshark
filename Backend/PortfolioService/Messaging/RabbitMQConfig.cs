namespace PortfolioService.Messaging
{
    public class RabbitMQConfig
    {
        public string Hostname { get; set; } = "localhost";
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public string ExchangeName { get; set; } = "portfolio.exchange";
    }
}
