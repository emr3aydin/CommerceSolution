using Commerce.Application.Features.Products.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Core.Common; // Make sure to include your Domain namespace
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Products.Queries
{
    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ApiResponse<ProductDto?>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public GetProductByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<ProductDto?>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken) // Updated return type
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Id == request.Id && p.IsActive)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Stock = p.Stock,
                    ImageUrl = p.ImageUrl,
                    SKU = p.SKU,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category!.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (product == null)
                return ApiResponse<ProductDto?>.ErrorResponse("Ürün bulunamadý veya aktif deðil.");

            return ApiResponse<ProductDto?>.SuccessResponse(product);
        }
    }
}

