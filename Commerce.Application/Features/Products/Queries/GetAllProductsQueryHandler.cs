using Commerce.Application.Features.Products.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Products.Queries
{
    public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, ApiResponse<IEnumerable<ProductDto>>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public GetAllProductsQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<IEnumerable<ProductDto>>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken) // Updated return type
        {
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            if (request.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);

            if (request.IsActive.HasValue)
                query = query.Where(p => p.IsActive == request.IsActive.Value);

            if (!string.IsNullOrEmpty(request.SearchTerm))
                query = query.Where(p => p.Name.Contains(request.SearchTerm) ||
                                           p.Description!.Contains(request.SearchTerm) ||
                                           p.SKU.Contains(request.SearchTerm));

            var products = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
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
                }).AsNoTracking()
                .ToListAsync(cancellationToken);

            return ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(products);
        }
    }
}