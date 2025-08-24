using Commerce.Core.Common;
using Commerce.Domain.Entities;
using MediatR;

namespace Commerce.Application.Features.Users.Commands
{
    public record UpdateProfileCommand(
        string UserId,
        string FirstName,
        string LastName,
        string? PhoneNumber,
        DateTime? DateOfBirth,
        string? Gender
    ) : IRequest<ApiResponse>;
}


