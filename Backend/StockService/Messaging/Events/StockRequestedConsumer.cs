using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using StockService.Messaging.Events;
using StockService.Interfaces;
using Shared.Dtos.Stock;

namespace StockService.Messaging
{
    public class StockRequestedConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<StockRequestedConsumer> _logger;

        public StockRequestedConsumer(
            IConnection connection,
            IServiceScopeFactory scopeFactory,
            ILogger<StockRequestedConsumer> logger)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var channel = await _connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "stock.requested",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (_, ea) =>
            {
                var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                var message = JsonSerializer.Deserialize<StockRequestedEvent>(body);

                using var scope = _scopeFactory.CreateScope();
                var stockRepo = scope.ServiceProvider.GetRequiredService<IStockRepository>();
                var fmpService = scope.ServiceProvider.GetRequiredService<IFMPService>();

                var stock = await stockRepo.GetByIdAsync(message.StockId);

                if (stock is null)
                    return;

                var symbol = stock.Symbol;

                var stockData = await fmpService.FindStockBySymbolAsync(symbol);

                if (stockData is null) {
                    _logger.LogInformation("Stock {symbol} was not returned by FMPService!", symbol);
                    return;
                }

                var updatedStock = new UpdateStockRequestDto
                {
                    Purchase = stockData.Purchase,
                    MarketCap = stockData.MarketCap,
                    LastDiv = stockData.LastDiv
                };

                await stockRepo.UpdateAsync(message.StockId, updatedStock);

                _logger.LogInformation("Stock {symbol} was successfully updated!", symbol);
            };

            await channel.BasicConsumeAsync(
                queue: "stock.requested",
                autoAck: true,
                consumer: consumer
            );
        }
    }
}
