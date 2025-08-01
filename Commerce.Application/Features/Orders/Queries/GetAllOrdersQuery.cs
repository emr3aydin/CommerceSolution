using Commerce.Application.Features.Orders.DTOs;
using MediatR;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Orders.Queries
{
    public record GetAllOrdersQuery(
        Guid? UserId = null,
        string? Status = null,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<ApiResponse<IEnumerable<OrderDto>>>; // Changed return type to ApiResponse<IEnumerable<OrderDto>>
}