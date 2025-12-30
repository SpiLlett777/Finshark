namespace StockService.Messaging
{
    public interface IMessageSubscriber
    {
        Task SubscribeAsync<T>(Func<T, Task> handleMessage);
    }
}
