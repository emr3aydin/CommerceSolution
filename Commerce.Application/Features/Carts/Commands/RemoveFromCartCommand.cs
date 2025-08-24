using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Carts.Commands
{
    public record RemoveFromCartCommand(
        Guid UserId,
        int CartItemId
    ) : IRequest<ApiResponse<bool>>;
}

