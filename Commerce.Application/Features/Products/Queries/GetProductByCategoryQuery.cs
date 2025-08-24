using Commerce.Application.Features.Products.DTOs;
using MediatR;
using Commerce.Core.Common; // Make sure to include your Domain namespace
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Products.Queries
{
    public record GetProductsByCategoryQuery(int CategoryId) : IRequest<ApiResponse<IEnumerable<ProductDto>>>; // Changed return type to ApiResponse<IEnumerable<ProductDto>>
}

