namespace Shared.Messaging
{
    public class UsernameRequest
    {
        public string AppUserId { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
    }
}
