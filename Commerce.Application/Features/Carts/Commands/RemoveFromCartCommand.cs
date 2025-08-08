using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Carts.Commands
{
    public record RemoveFromCartCommand(
        Guid UserId,
        int CartItemId
    ) : IRequest<ApiResponse<bool>>;
}