using Shared.Dtos.Comment;
using Shared.Extensions;
using StockService.Helpers;
using StockService.Interfaces;
using StockService.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace StockService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepo;
        private readonly IStockRepository _stockRepo;
        private readonly IFMPService _fmpService;

        public CommentController(ICommentRepository commentRepo, IStockRepository stockRepo, IFMPService fmpService)
        {
            _commentRepo = commentRepo;
            _stockRepo = stockRepo;
            _fmpService = fmpService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll([FromQuery] CommentQueryObject queryObject)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var comments = await _commentRepo.GetAllAsync(queryObject);

            var commentsDto = comments.Select(c => c.ToCommentDto());

            return Ok(commentsDto);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var comment = await _commentRepo.GetByIdAsync(id);

            if (comment is null)
                return NotFound();

            return Ok(comment.ToCommentDto());
        }

        [HttpPost("{symbol:alpha}")]
        [Authorize]
        public async Task<IActionResult> Create([FromRoute] string symbol, CreateCommentDto commentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var stock = await _stockRepo.GetBySymbolAsync(symbol);

            if (stock is null)
            {
                stock = await _fmpService.FindStockBySymbolAsync(symbol);

                if (stock is null)
                    return BadRequest("Stock does not exist!");
                else
                    await _stockRepo.CreateAsync(stock);
            }

            var username = User.GetUsername();
            var userId = User.GetUserId();

            var commentModel = commentDto.ToCommentFromCreate(stock.Id);
            commentModel.AppUserId = userId;
            commentModel.CreatedBy = username;

            await _commentRepo.CreateAsync(commentModel);
            return CreatedAtAction(nameof(GetById), new { id = commentModel.Id }, commentModel.ToCommentDto());
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateCommentRequestDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _commentRepo.GetByIdAsync(id);
            
            if (existing is null)
                return NotFound("Comment is not found!");

            var userId = User.GetUserId();

            if (existing.AppUserId != userId)
                return Forbid();

            existing.Title = updateDto.Title;
            existing.Content = updateDto.Content;

            var updated = await _commentRepo.UpdateAsync(id, existing);
            return Ok(updated!.ToCommentDto());
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var comment = await _commentRepo.GetByIdAsync(id);

            if (comment is null)
                return NotFound("Comment does not exist!");

            var userId = User.GetUserId();

            if (comment.AppUserId != userId)
                return Forbid();

            await _commentRepo.DeleteAsync(id);

            return NoContent();
        }
    }
}
