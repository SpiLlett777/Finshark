using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace PortfolioService.Messaging
{
    public class RabbitMqPublisher : IMessagePublisher
    {
        private readonly IConnection _connection;
        private readonly ILogger<RabbitMqPublisher> _logger;

        public RabbitMqPublisher(IConnection connection, ILogger<RabbitMqPublisher> logger)
        {
            _connection = connection;
            _logger = logger;
        }

        public async Task PublishAsync<T>(T message)
        {
            using var channel = await _connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "stock.requested",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            _logger.LogInformation(
                "Publishing message to RabbitMQ! Queue = {Queue}, Payload = {Payload}",
                "stock.requested",
                json
            );

            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: "stock.requested",
                body: body
            );

            _logger.LogInformation(
                "Message was successfully published to RabbitMQ! Queue = {Queue}",
                "stock.requested"
            );
        }
    }
}
