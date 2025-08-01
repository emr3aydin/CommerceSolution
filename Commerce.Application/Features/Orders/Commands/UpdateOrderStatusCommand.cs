using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Orders.Commands
{
    public record UpdateOrderStatusCommand(
        int OrderId,
        string Status,
        Guid ApprovedBy
    ) : IRequest<ApiResponse<bool>>; // Changed return type to ApiResponse<bool>
}