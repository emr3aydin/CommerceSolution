using Commerce.Application.Features.Carts.DTOs;
using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Carts.Queries
{
    public record GetCartByUserIdQuery(Guid UserId) : IRequest<ApiResponse<CartDto?>>;
}

