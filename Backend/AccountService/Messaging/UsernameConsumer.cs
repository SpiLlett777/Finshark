using AccountService.Models;
using Microsoft.AspNetCore.Identity;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Shared.Messaging;
using System.Text;
using System.Text.Json;

namespace AccountService.Messaging
{
    public class UsernameConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<UsernameConsumer> _logger;

        public UsernameConsumer(IConnection connection, IServiceScopeFactory scopeFactory, ILogger<UsernameConsumer> logger)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var channel = await _connection.CreateChannelAsync();
            _logger.LogInformation("'UserConsumer' channel is created!");

            await channel.QueueDeclareAsync(
                queue: "username.request",
                durable: true,
                exclusive: false,
                autoDelete: false
            );
            _logger.LogInformation("Queue 'username.request' is declared!");

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (_, ea) =>
            {
                var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                var request = JsonSerializer.Deserialize<UsernameRequest>(body);

                if (request is null)
                {
                    _logger.LogWarning("Null or invalid request is received!");
                    return;
                }

                _logger.LogInformation(
                    "Username request for AppUserId is receieved: {UserId}, CorrelationId: {CorrelationId}", 
                    request.AppUserId, 
                    request.CorrelationId
                );

                using var scope = _scopeFactory.CreateScope();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

                var user = await userManager.FindByIdAsync(request.AppUserId);

                var response = new UsernameResponse
                {
                    AppUserId = request.AppUserId,
                    Username = user?.UserName ?? "Unknown",
                    CorrelationId = request.CorrelationId
                };

                var responseJson = JsonSerializer.Serialize(response);
                var responseBody = Encoding.UTF8.GetBytes(responseJson);

                await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: "username.response",
                    body: responseBody
                );

                _logger.LogInformation("" +
                    "Username response is published for user {UserId}: {Username}", 
                    response.AppUserId, 
                    response.Username
                );
            };

            await channel.BasicConsumeAsync(
                queue: "username.request",
                autoAck: true,
                consumer: consumer
            );

            _logger.LogInformation("UsernameConsumer is now listening to 'username.request' queue!");
        }

    }
}
