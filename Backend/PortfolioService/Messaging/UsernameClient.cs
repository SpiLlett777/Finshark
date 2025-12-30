using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Shared.Messaging;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;

namespace PortfolioService.Messaging
{
    public class UsernameClient : BackgroundService
    {
        private IChannel? _channel;
        private readonly IConnection _connection;
        private readonly ConcurrentDictionary<string, TaskCompletionSource<string>> _pending;
        private readonly ILogger<UsernameClient> _logger;

        public UsernameClient(IConnection connection, ILogger<UsernameClient> logger)
        {
            _connection = connection;
            _logger = logger;
            _pending = new ConcurrentDictionary<string, TaskCompletionSource<string>>();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _channel = await _connection.CreateChannelAsync();
            _logger.LogInformation("UsernameClient channel is created!");

            await _channel.QueueDeclareAsync(
                queue: "username.response",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            _logger.LogInformation("Queue 'username.response' is declared!");

            var consumer = new AsyncEventingBasicConsumer(_channel);

            consumer.ReceivedAsync += async (_, ea) =>
            {
                var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                var response = JsonSerializer.Deserialize<UsernameResponse>(body);

                if (response is null)
                {
                    _logger.LogWarning("Invalid username response is received!");
                    return;
                }

                if (_pending.TryRemove(response.CorrelationId, out var tcs))
                {
                    tcs.TrySetResult(response.Username);
                    _logger.LogInformation(
                        "Username response received: {UserId} → {Username}",
                        response.AppUserId,
                        response.Username
                    );
                }
                else
                {
                    _logger.LogWarning(
                        "No pending request for CorrelationId {CorrelationId}",
                        response.CorrelationId
                    );
                }

                await Task.CompletedTask;
            };

            await _channel.BasicConsumeAsync(
                queue: "username.response",
                autoAck: true,
                consumer: consumer
            );

            _logger.LogInformation("UsernameClient is listening to 'username.response'!");

            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

        public async Task<string> GetUsernameAsync(string userId)
        {
            if (_channel is null)
                throw new InvalidOperationException("UsernameClient is not initialized!");

            var correlationId = Guid.NewGuid().ToString();
            var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);

            _pending[correlationId] = tcs;

            var request = new UsernameRequest
            {
                AppUserId = userId,
                CorrelationId = correlationId
            };

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(request));

            await _channel.BasicPublishAsync(
                exchange: "",
                routingKey: "username.request",
                body: body
            );

            _logger.LogInformation(
                "Username request sent: {UserId}, CorrelationId={CorrelationId}",
                userId,
                correlationId
            );

            return await tcs.Task;
        }
    }
}
