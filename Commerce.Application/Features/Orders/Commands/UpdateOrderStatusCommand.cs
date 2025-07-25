using MediatR;

namespace Commerce.Application.Features.Orders.Commands
{
    public record UpdateOrderStatusCommand(
        int OrderId,
        string Status,
        Guid ApprovedBy
    ) : IRequest<bool>;
}
