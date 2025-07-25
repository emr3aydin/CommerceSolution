using Commerce.Application.Features.Products.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Products.Queries
{
    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
    {
        private readonly ApplicationDbContext _context;

        public GetProductByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Id == request.Id && p.IsActive)
                .Select(p => new ProductDto(
                    p.Id,
                    p.Name,
                    p.Description ?? string.Empty,
                    p.Price,
                    p.Stock,
                    p.ImageUrl,
                    p.SKU,
                    p.CategoryId,
                    p.IsActive,
                    p.CreatedAt
                ))
                .FirstOrDefaultAsync(cancellationToken);

            return product;
        }
    }
}
