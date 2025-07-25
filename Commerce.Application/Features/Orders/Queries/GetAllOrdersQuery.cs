using Commerce.Application.Features.Orders.DTOs;
using MediatR;

namespace Commerce.Application.Features.Orders.Queries
{
    public record GetAllOrdersQuery(
        Guid? UserId = null,
        string? Status = null,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<IEnumerable<OrderDto>>;
}
