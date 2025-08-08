using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Orders.Commands
{
    public record CreateOrderCommand(
        Guid UserId,
        string ShippingAddress,
        List<CreateOrderItemCommand> OrderItems
    ) : IRequest<ApiResponse<int>>; // Changed return type to ApiResponse<int>

    public record CreateOrderItemCommand(
        int ProductId,
        int Quantity
    );
}