using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Users.Commands{
    public record RegisterUserCommand(string Email, string Username, string Password, string FirstName, string LastName, DateTime DateOfBirth, string Gender, string PhoneNumber) : IRequest<ApiResponse>;
}