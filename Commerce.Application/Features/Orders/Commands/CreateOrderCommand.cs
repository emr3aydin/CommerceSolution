using MediatR;

namespace Commerce.Application.Features.Orders.Commands
{
    public record CreateOrderCommand(
        Guid UserId,
        string ShippingAddress,
        List<CreateOrderItemCommand> OrderItems
    ) : IRequest<int>;

    public record CreateOrderItemCommand(
        int ProductId,
        int Quantity
    );
}
