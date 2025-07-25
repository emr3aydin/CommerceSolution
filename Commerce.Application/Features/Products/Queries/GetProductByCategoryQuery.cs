using Commerce.Application.Features.Products.DTOs;
using MediatR;

namespace Commerce.Application.Features.Products.Queries
{
    public record GetProductsByCategoryQuery(int CategoryId) : IRequest<IEnumerable<ProductDto>>;
}
