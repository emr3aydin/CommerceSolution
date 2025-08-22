using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Users.Commands
{
    public record VerifyEmailCommand(string Email, string VerificationCode) : IRequest<ApiResponse>;
}


