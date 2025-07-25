using Commerce.Application.Features.Products.DTOs;
using MediatR;

namespace Commerce.Application.Features.Products.Queries
{
    public class GetAllProductsQuery : IRequest<List<ProductDto>>
    {
    }
}
