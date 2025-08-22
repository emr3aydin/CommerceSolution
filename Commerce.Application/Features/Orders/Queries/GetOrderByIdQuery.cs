using Commerce.Application.Features.Orders.DTOs;
using MediatR;
using Commerce.Core.Common; // Make sure to include your Domain namespace
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Orders.Queries
{
    public record GetOrderByIdQuery(int Id) : IRequest<ApiResponse<OrderDto?>>; // Changed return type to ApiResponse<OrderDto?>
}

