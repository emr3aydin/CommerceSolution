using Commerce.Application.Features.Users.Commands;
using Commerce.Application.Features.Users.DTOs;
using Commerce.Infrastructure.Interfaces;
using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Commerce.Application.Features.Users.Commands
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse<TokenResponseDto>>
    {
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<RefreshTokenCommandHandler> _logger;

        public RefreshTokenCommandHandler(
            IJwtTokenService jwtTokenService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<RefreshTokenCommandHandler> logger)
        {
            _jwtTokenService = jwtTokenService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<ApiResponse<TokenResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var ipAddress = GetIpAddress();

                // Refresh token'ı validate et
                var isValid = await _jwtTokenService.ValidateRefreshToken(request.RefreshToken);
                if (!isValid)
                {
                    return ApiResponse<TokenResponseDto>.ErrorResponse("Geçersiz refresh token.");
                }

                // User'ı refresh token ile bul
                var user = await _jwtTokenService.GetUserByRefreshToken(request.RefreshToken);
                if (user == null)
                {
                    return ApiResponse<TokenResponseDto>.ErrorResponse("Kullanıcı bulunamadı.");
                }

                // Yeni token'lar oluştur
                var newAccessToken = await _jwtTokenService.GenerateToken(user);
                var newRefreshToken = await _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);

                // Eski refresh token'ı revoke et
                await _jwtTokenService.RevokeRefreshToken(request.RefreshToken, ipAddress, newRefreshToken.Token);

                var tokenResponse = new TokenResponseDto
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken.Token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    TokenType = "Bearer"
                };

                _logger.LogInformation("Token refreshed successfully for user {UserId}", user.Id);

                return ApiResponse<TokenResponseDto>.SuccessResponse(tokenResponse, "Token başarıyla yenilendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return ApiResponse<TokenResponseDto>.ErrorResponse("Token yenileme sırasında bir hata oluştu.");
            }
        }

        private string GetIpAddress()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null) return "unknown";

            if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
                return context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();

            if (context.Request.Headers.ContainsKey("X-Real-IP"))
                return context.Request.Headers["X-Real-IP"].ToString();

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }

    public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, ApiResponse<bool>>
    {
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<RevokeTokenCommandHandler> _logger;

        public RevokeTokenCommandHandler(
            IJwtTokenService jwtTokenService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<RevokeTokenCommandHandler> logger)
        {
            _jwtTokenService = jwtTokenService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<ApiResponse<bool>> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var ipAddress = GetIpAddress();

                // Refresh token'ı validate et
                var isValid = await _jwtTokenService.ValidateRefreshToken(request.RefreshToken);
                if (!isValid)
                {
                    return ApiResponse<bool>.ErrorResponse("Geçersiz refresh token.");
                }

                // Refresh token'ı revoke et
                await _jwtTokenService.RevokeRefreshToken(request.RefreshToken, ipAddress);

                _logger.LogInformation("Token revoked successfully");

                return ApiResponse<bool>.SuccessResponse(true, "Token başarıyla iptal edildi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking token");
                return ApiResponse<bool>.ErrorResponse("Token iptal etme sırasında bir hata oluştu.");
            }
        }

        private string GetIpAddress()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null) return "unknown";

            if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
                return context.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0].Trim();

            if (context.Request.Headers.ContainsKey("X-Real-IP"))
                return context.Request.Headers["X-Real-IP"].ToString();

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }
}


