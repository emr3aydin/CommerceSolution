using Commerce.Application.Features.Orders.DTOs;
using MediatR;

namespace Commerce.Application.Features.Orders.Queries
{
    public record GetOrderByIdQuery(int Id) : IRequest<OrderDto?>;
}
