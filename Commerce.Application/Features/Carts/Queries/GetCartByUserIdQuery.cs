using Commerce.Application.Features.Carts.DTOs;
using MediatR;

namespace Commerce.Application.Features.Carts.Queries
{
    public record GetCartByUserIdQuery(Guid UserId) : IRequest<CartDto?>;
}
