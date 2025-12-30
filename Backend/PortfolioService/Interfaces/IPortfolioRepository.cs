using PortfolioService.Models;

namespace PortfolioService.Interfaces
{
    public interface IPortfolioRepository
    {
        Task<List<Portfolio>> GetUserPortfolio(string userId);
        Task<Portfolio> CreateAsync(Portfolio portfolio);
        Task<Portfolio> DeleteAsync(string userId, int stockId);
        Task<Portfolio> UpdateQuantityAsync(string userId, int stockId, int newQuantity);
        Task<bool> TransferAsync(string fromUserId, string toUserId, int stockId, int quantity);
    }
}
