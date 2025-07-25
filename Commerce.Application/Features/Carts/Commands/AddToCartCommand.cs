using MediatR;

namespace Commerce.Application.Features.Carts.Commands
{
    public record AddToCartCommand(
        Guid UserId,
        int ProductId,
        int Quantity
    ) : IRequest<bool>;
}
