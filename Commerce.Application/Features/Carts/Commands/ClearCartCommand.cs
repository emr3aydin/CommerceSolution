using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Carts.Commands
{
    public record ClearCartCommand(
        Guid UserId
    ) : IRequest<ApiResponse<bool>>;
}

