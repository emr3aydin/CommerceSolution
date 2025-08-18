using Commerce.Application.Features.Users.DTOs;
using Commerce.Application.Features.Users.Interfaces;
using Commerce.Domain;
using Commerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace Commerce.Application.Features.Users.Commands
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, ApiResponse<object>>
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<LoginUserCommandHandler> _logger;

        public LoginUserCommandHandler(
            UserManager<User> userManager, 
            SignInManager<User> signInManager, 
            IJwtTokenService jwtTokenService,
            IHttpContextAccessor httpContextAccessor,
            ILogger<LoginUserCommandHandler> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<ApiResponse<object>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                User? user = null;

                bool isEmail = Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

                if (isEmail)
                {
                    user = await _userManager.FindByEmailAsync(request.Email);
                }
                else
                {
                    user = await _userManager.FindByNameAsync(request.Email);
                }

                if (user == null)
                {
                    return ApiResponse<object>.ErrorResponse("Geçersiz kullanıcı adı/email veya şifre.");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

                if (!result.Succeeded)
                {
                    return ApiResponse<object>.ErrorResponse("Geçersiz kullanıcı adı/email veya şifre.");
                }

                if (!user.IsActive)
                {
                    return ApiResponse<object>.ErrorResponse("Hesabınız henüz aktif değil. Lütfen hesabınızı onaylayın.");
                }

                // IP adresini al
                var ipAddress = GetIpAddress();

                // Kullanıcının mevcut tüm refresh token'larını iptal et (güvenlik için)
                await _jwtTokenService.RevokeAllUserRefreshTokens(user.Id, ipAddress);

                // Yeni token'lar oluştur
                var accessToken = await _jwtTokenService.GenerateToken(user);
                var refreshToken = await _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);

                var tokenResponse = new TokenResponseDto
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                    TokenType = "Bearer"
                };

                _logger.LogInformation("User {UserId} logged in successfully", user.Id);

                return ApiResponse<object>.SuccessResponse(tokenResponse, "Giriş başarılı.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email {Email}", request.Email);
                return ApiResponse<object>.ErrorResponse("Giriş sırasında bir hata oluştu.");
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
