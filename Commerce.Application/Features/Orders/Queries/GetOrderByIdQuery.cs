using Commerce.Application.Features.Orders.DTOs;
using MediatR;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Orders.Queries
{
    public record GetOrderByIdQuery(int Id) : IRequest<ApiResponse<OrderDto?>>; // Changed return type to ApiResponse<OrderDto?>
}