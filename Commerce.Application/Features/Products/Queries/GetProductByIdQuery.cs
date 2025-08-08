using Commerce.Application.Features.Products.DTOs;
using MediatR;
using Commerce.Domain;
namespace Commerce.Application.Features.Products.Queries
{
    public record GetProductByIdQuery(int Id) : IRequest<ApiResponse<ProductDto?>>;
}