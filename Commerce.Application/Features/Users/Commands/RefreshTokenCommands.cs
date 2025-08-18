using Commerce.Application.Features.Users.DTOs;
using Commerce.Domain;
using MediatR;

namespace Commerce.Application.Features.Users.Commands
{
    public class RefreshTokenCommand : IRequest<ApiResponse<TokenResponseDto>>
    {
        public string RefreshToken { get; }

        public RefreshTokenCommand(string refreshToken)
        {
            RefreshToken = refreshToken;
        }
    }

    public class RevokeTokenCommand : IRequest<ApiResponse<bool>>
    {
        public string RefreshToken { get; }

        public RevokeTokenCommand(string refreshToken)
        {
            RefreshToken = refreshToken;
        }
    }
}
