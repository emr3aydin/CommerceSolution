using Commerce.Application.Features.Carts.DTOs;
using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Carts.Queries
{
    public record GetCartByUserIdQuery(Guid UserId) : IRequest<ApiResponse<CartDto?>>;
}