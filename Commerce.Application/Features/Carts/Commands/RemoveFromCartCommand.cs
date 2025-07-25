using MediatR;

namespace Commerce.Application.Features.Carts.Commands
{
    public record RemoveFromCartCommand(
        Guid UserId,
        int CartItemId
    ) : IRequest<bool>;
}
