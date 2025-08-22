using Commerce.Application.Features.Products.DTOs;
using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;
namespace Commerce.Application.Features.Products.Queries
{
    public record GetProductByIdQuery(int Id) : IRequest<ApiResponse<ProductDto?>>;
}

