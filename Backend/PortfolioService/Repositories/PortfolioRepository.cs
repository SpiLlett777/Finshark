using PortfolioService.Data;
using PortfolioService.Interfaces;
using PortfolioService.Models;
using Microsoft.EntityFrameworkCore;

namespace PortfolioService.Repository
{
    public class PortfolioRepository : IPortfolioRepository
    {
        private readonly PortfolioDbContext _context;
        public PortfolioRepository(PortfolioDbContext context)
        {
            _context = context;
        }

        public async Task<Portfolio> CreateAsync(Portfolio portfolio)
        {
            await _context.Portfolios.AddAsync(portfolio);
            await _context.SaveChangesAsync();
            return portfolio;
        }

        public async Task<Portfolio> DeleteAsync(string userId, int stockId)
        {
            var portfolioModel = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.AppUserId == userId && p.StockId == stockId);

            if (portfolioModel is null)
                return null;

            _context.Portfolios.Remove(portfolioModel);
            await _context.SaveChangesAsync();

            return portfolioModel;
        }

        public async Task<List<Portfolio>> GetUserPortfolio(string userId)
        {
            return await _context.Portfolios
                .Where(p => p.AppUserId == userId)
                .ToListAsync();
        }
        public async Task<Portfolio> UpdateQuantityAsync(string userId, int stockId, int newQuantity)
        {
            var portfolioEntry = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.AppUserId == userId && p.StockId == stockId);

            if (portfolioEntry is null)
                return null;

            portfolioEntry.Quantity = newQuantity;
            _context.Portfolios.Update(portfolioEntry);
            await _context.SaveChangesAsync();

            return portfolioEntry;
        }

        public async Task<bool> TransferAsync(string fromUserId, string toUserId, int stockId, int quantity)
        {
            if (quantity <= 0)
                return false;

            var fromEntry = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.AppUserId == fromUserId && p.StockId == stockId);

            if (fromEntry is null || fromEntry.Quantity < quantity) 
                return false;

            fromEntry.Quantity -= quantity;
            if (fromEntry.Quantity == 0)
                _context.Portfolios.Remove(fromEntry);
            else
                _context.Portfolios.Update(fromEntry);

            var toEntry = await _context.Portfolios
                .FirstOrDefaultAsync(p => p.AppUserId == toUserId && p.StockId == stockId);

            if (toEntry is not null)
            {
                toEntry.Quantity += quantity;
                _context.Portfolios.Update(toEntry);
            }
            else
            {
                var newEntry = new Portfolio
                {
                    AppUserId = toUserId,
                    StockId = stockId,
                    Quantity = quantity,
                    AddedAt = DateTime.UtcNow
                };

                await _context.Portfolios.AddAsync(newEntry);
            }

            await _context.SaveChangesAsync();

            return true;
        }

    }
}
