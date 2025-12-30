using Shared.Extensions;
using PortfolioService.Interfaces;
using PortfolioService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PortfolioService.Messaging;
using PortfolioService.Messaging.Events;

namespace PortfolioService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly IPortfolioRepository _portfolioRepo;
        private readonly IMessagePublisher _publisher;
        public PortfolioController(IPortfolioRepository portfolioRepo, IMessagePublisher publisher)
        {
            _portfolioRepo = portfolioRepo;
            _publisher = publisher;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserPortfolio([FromServices] UsernameClient usernameClient)
        {
            var userId = User.GetUserId();
            var portfolio = await _portfolioRepo.GetUserPortfolio(userId);

            var username =  await usernameClient.GetUsernameAsync(userId);

            return Ok(new
            {
                Username = username,
                Items = portfolio
            });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddPortfolio([FromQuery] int stockId)
        {
            var userId = User.GetUserId();

            var existing = await _portfolioRepo.GetUserPortfolio(userId);

            if (existing.Any(p => p.StockId == stockId))
                return BadRequest("Stock is already in portfolio!");

            var newPortfolio = new Portfolio
            {
                AppUserId = userId,
                StockId = stockId,
                Quantity = 1,
                AddedAt = DateTime.UtcNow
            };

            await _portfolioRepo.CreateAsync(newPortfolio);

            await _publisher.PublishAsync(new StockRequestedEvent { StockId = stockId });

            return Accepted($"Stock request for {stockId} is sent to StockService!");
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> DeletePortfolio(int stockId)
        {
            var userId = User.GetUserId();

            var deleted = await _portfolioRepo.DeleteAsync(userId, stockId);

            if (deleted is null) 
                return NotFound("Stock is not found in portfolio!");

            return Ok();
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromQuery] int stockId, [FromQuery] int quantity)
        {
            if (quantity < 0)
                return BadRequest("Quantity cannot be negative!");

            var userId = User.GetUserId();

            var updated = await _portfolioRepo.UpdateQuantityAsync(userId, stockId, quantity);

            if (updated is null)
                return NotFound("Portfolio entry is not found!");

            return Ok(updated);
        }

        [HttpPost("transfer")]
        [Authorize]
        public async Task<IActionResult> Transfer([FromQuery] int stockId, [FromQuery] int quantity, [FromQuery] string toUserId)
        {
            if (quantity <= 0)
                return BadRequest("Quantity must be positive!");

            var fromUserId = User.GetUserId();
            var success = await _portfolioRepo.TransferAsync(fromUserId, toUserId, stockId, quantity);

            if (!success)
                return BadRequest("Transfer failed. Check quantities or symbol!");

            return Ok("Transfer completed!");
        }
    }
}
