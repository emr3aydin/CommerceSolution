using Commerce.Application.Features.Products.DTOs;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;

namespace Commerce.Application.Features.Products.Commands
{
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
    {
        private readonly ApplicationDbContext _context;

        public CreateProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
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
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);

            return new ProductDto(
                product.Id,
                product.Name,
                product.Description ?? string.Empty,
                product.Price,
                product.Stock,
                product.ImageUrl,
                product.SKU,
                product.CategoryId,
                product.IsActive,
                product.CreatedAt
            );
        }
    }
}
