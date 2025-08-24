using Commerce.Core.Common;
using Commerce.Domain.Entities;
using MediatR;

namespace Commerce.Application.Features.Users.Commands
{
    public record SendPasswordResetCodeCommand(string Email) : IRequest<ApiResponse<bool>>;
    
    public record ResetPasswordCommand(string Email, string Code, string NewPassword) : IRequest<ApiResponse<bool>>;
    
    public record ChangePasswordCommand(string UserId, string CurrentPassword, string NewPassword) : IRequest<ApiResponse<bool>>;
}


