using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Orders.Commands
{
    public record UpdateOrderStatusCommand(
        int OrderId,
        string Status,
        Guid ApprovedBy
    ) : IRequest<ApiResponse<bool>>; // Changed return type to ApiResponse<bool>
}

