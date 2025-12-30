namespace Shared.Messaging
{
    public class UsernameResponse
    {
        public string AppUserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
    }
}
