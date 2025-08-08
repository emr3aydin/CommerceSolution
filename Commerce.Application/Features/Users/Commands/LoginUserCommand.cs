using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Users.Commands
{
    public record LoginUserCommand(string Email, string Password) : IRequest<ApiResponse<object>>;
}