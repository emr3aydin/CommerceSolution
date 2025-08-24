using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Core.Common; // Make sure to include your Domain namespace
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Products.Commands
{
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ApiResponse<int>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public CreateProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<int>> Handle(CreateProductCommand request, CancellationToken cancellationToken) // Updated return type
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

            if (!categoryExists)
                return ApiResponse<int>.ErrorResponse("Belirtilen kategori bulunamadi.");

            var skuExists = await _context.Products
                .AnyAsync(p => p.SKU == request.SKU, cancellationToken);

            if (skuExists)
                return ApiResponse<int>.ErrorResponse("Bu SKU zaten kullanimda.");

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                ImageUrl = request.ImageUrl,
                SKU = request.SKU,
                CategoryId = request.CategoryId,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<int>.SuccessResponse(product.Id, "Ürün basariyla olusturuldu.");
        }
    }
}

