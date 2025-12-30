namespace PortfolioService.Messaging
{
    public interface IMessagePublisher
    {
        Task PublishAsync<T>(T message);
    }
}
