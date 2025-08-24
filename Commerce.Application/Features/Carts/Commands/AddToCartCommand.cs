using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Carts.Commands
{
    public record AddToCartCommand(
        Guid UserId,
        int ProductId,
        int Quantity
    ) : IRequest<ApiResponse<bool>>; // Changed return type to ApiResponse<bool>
}

