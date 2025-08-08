using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Carts.Commands
{
    public record ClearCartCommand(
        Guid UserId
    ) : IRequest<ApiResponse<bool>>;
}