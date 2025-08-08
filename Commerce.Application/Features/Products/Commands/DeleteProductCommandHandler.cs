using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; 

namespace Commerce.Application.Features.Products.Commands
{
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, ApiResponse<bool>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public DeleteProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<bool>> Handle(DeleteProductCommand request, CancellationToken cancellationToken) // Updated return type
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Ürün bulunamadı.");

            var hasActiveReferences = await _context.CartItems
                .AnyAsync(ci => ci.ProductId == request.Id, cancellationToken) ||
                await _context.OrderItems
                .AnyAsync(oi => oi.ProductId == request.Id, cancellationToken);

            if (hasActiveReferences)
                return ApiResponse<bool>.ErrorResponse("Bu ürün sepetlerde veya siparişlerde kullanıldığı için silinemez.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync(cancellationToken);
            return ApiResponse<bool>.SuccessResponse(true, "Ürün başarıyla silindi.");
        }
    }
}