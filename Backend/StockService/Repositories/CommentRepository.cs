using StockService.Data;
using StockService.Helpers;
using StockService.Interfaces;
using StockService.Models;
using Microsoft.EntityFrameworkCore;

namespace StockService.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly StockDbContext _context;
        public CommentRepository(StockDbContext context)
        {
            _context = context;
        }
        public async Task<List<Comment>> GetAllAsync(CommentQueryObject queryObject)
        {
            var comments = _context.Comments.Include(c => c.Stock).AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryObject.Symbol))
                comments = comments.Where(s => s.Stock!.Symbol.ToLower() == queryObject.Symbol.ToLower());

            if (queryObject.IsDescending is true)
                comments = comments.OrderByDescending(c => c.CreatedOn);

            return await comments.ToListAsync();
        }

        public async Task<Comment?> GetByIdAsync(int id)
        {
            return await _context.Comments.Include(c => c.Stock).FirstOrDefaultAsync(c => c.Id == id);
        }
        public async Task<Comment> CreateAsync(Comment commentModel)
        {
            await _context.Comments.AddAsync(commentModel);
            await _context.SaveChangesAsync();
            return commentModel;
        }

        public async Task<Comment?> UpdateAsync(int id, Comment commentModel)
        {
            var existingComment = await _context.Comments.FindAsync(id);

            if (existingComment is null)
                return null;

            existingComment.Title = commentModel.Title;
            existingComment.Content = commentModel.Content;

            await _context.SaveChangesAsync();

            return existingComment;
        }

        public async Task<Comment?> DeleteAsync(int id)
        {
            var commentModel = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id);

            if (commentModel is null)
                return null;

            _context.Comments.Remove(commentModel);

            await _context.SaveChangesAsync();

            return commentModel;
        }
    }
}
