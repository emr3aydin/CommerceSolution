using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Products.Commands
{
    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ApiResponse<bool>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public UpdateProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateProductCommand request, CancellationToken cancellationToken) // Updated return type
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Ürün bulunamadı.");

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

            if (!categoryExists)
                return ApiResponse<bool>.ErrorResponse("Belirtilen kategori bulunamadı.");

            var skuExists = await _context.Products
                .AnyAsync(p => p.SKU == request.SKU && p.Id != request.Id, cancellationToken);

            if (skuExists)
                return ApiResponse<bool>.ErrorResponse("Bu SKU zaten kullanımda.");

            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.Stock = request.Stock;
            product.ImageUrl = request.ImageUrl;
            product.SKU = request.SKU;
            product.CategoryId = request.CategoryId;
            product.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return ApiResponse<bool>.SuccessResponse(true, "Ürün başarıyla güncellendi.");
        }
    }
}