using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace StockService.Messaging
{
    public class RabbitMQSubscriber : IMessageSubscriber, IAsyncDisposable
    {
        private readonly RabbitMQConfig _config;
        private readonly ILogger<RabbitMQSubscriber> _logger;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQSubscriber(RabbitMQConfig config, ILogger<RabbitMQSubscriber> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SubscribeAsync<T>(Func<T, Task> handleMessage)
        {
            _logger.LogInformation(
                "Connecting to RabbitMQ! Host = {Host}",
                _config.Hostname
            );

            var factory = new ConnectionFactory
            {
                HostName = _config.Hostname,
                UserName = _config.Username,
                Password = _config.Password
            };

            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            await _channel.ExchangeDeclareAsync(
                exchange: _config.ExchangeName,
                type: ExchangeType.Fanout,
                durable: true
            );

            var queueDeclareOk = await _channel.QueueDeclareAsync(
                queue: "stock.requested.queue",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            var queueName = queueDeclareOk.QueueName;

            await _channel.QueueBindAsync(
                queue: queueName,
                exchange: _config.ExchangeName,
                routingKey: ""
            );

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (sender, ea) =>
            {
                var json = Encoding.UTF8.GetString(ea.Body.ToArray());

                _logger.LogInformation(
                    "RabbitMQ message is received! Queue = {Queue}, Payload = {Payload}",
                    "stock.requested",
                    json
                );

                try
                {
                    var obj = JsonSerializer.Deserialize<T>(json);

                    if (obj is not null)
                        await handleMessage(obj);

                    _logger.LogInformation("RabbitMQ has proccessed message successfully!");
                }
                catch(Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "RabbitMQ has proccessed message with errors!"
                    );
                }
            };

            await _channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: true,
                consumer: consumer
            );

            _logger.LogInformation(
                "RabbitMQ consumer has started! Queue = {Queue}",
                queueName
            );
        }

        async ValueTask IAsyncDisposable.DisposeAsync()
        {
            if (_channel is not null)
                await _channel.CloseAsync();

            if (_connection is not null)
                await _connection.CloseAsync();
        }
    }
}
