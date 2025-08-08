using Commerce.Application.Features.Products.DTOs;
using MediatR;
using Commerce.Domain;
namespace Commerce.Application.Features.Products.Queries
{
    public record GetAllProductsQuery(
        int? CategoryId = null,
        bool? IsActive = null,
        string? SearchTerm = null,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<ApiResponse<IEnumerable<ProductDto>>>;
}