using Commerce.Application.Features.Products.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain;

namespace Commerce.Application.Features.Products.Queries
{
    public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, ApiResponse<IEnumerable<ProductDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetProductsByCategoryQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<IEnumerable<ProductDto>>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == request.CategoryId && p.IsActive)
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
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (!products.Any())
            {
                return ApiResponse<IEnumerable<ProductDto>>.ErrorResponse("Bu kategoriye ait aktif ürün bulunamadı.");
            }

            return ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(products);
        }
    }
}