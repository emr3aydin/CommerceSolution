using Commerce.Application.Features.Users.DTOs;
using Commerce.Application.Features.Users.Queries;
using Commerce.Infrastructure.Interfaces;
using Commerce.Core.Common;
using Commerce.Domain.Entities;
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
                _logger.LogInformation("=== LOGIN ATTEMPT START ===");
                _logger.LogInformation("Login attempt for: {Email}", request.Email);
                _logger.LogInformation("IP Address: {IpAddress}", GetIpAddress());

                User? user = null;

                bool isEmail = Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                _logger.LogInformation("Input type: {InputType}", isEmail ? "Email" : "Username");

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
                    _logger.LogWarning("User not found for: {Email}", request.Email);
                    return ApiResponse<object>.ErrorResponse("Ge�ersiz kullanici adi/email veya sifre.");
                }

                _logger.LogInformation("User found: {UserId} - {UserName} - Active: {IsActive}", 
                    user.Id, user.UserName, user.IsActive);

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
                _logger.LogInformation("Password check result: Succeeded={Succeeded}, IsLockedOut={IsLockedOut}, RequiresTwoFactor={RequiresTwoFactor}", 
                    result.Succeeded, result.IsLockedOut, result.RequiresTwoFactor);

                if (!result.Succeeded)
                {
                    if (result.IsLockedOut)
                    {
                        _logger.LogWarning("User {UserId} is locked out", user.Id);
                        return ApiResponse<object>.ErrorResponse("Hesabiniz ge�ici olarak kilitlendi. L�tfen daha sonra tekrar deneyin.");
                    }
                    
                    _logger.LogWarning("Invalid password for user {UserId}", user.Id);
                    return ApiResponse<object>.ErrorResponse("Ge�ersiz kullanici adi/email veya sifre.");
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("User {UserId} is not active", user.Id);
                    return ApiResponse<object>.ErrorResponse("Hesabiniz hen�z aktif degil. L�tfen hesabinizi onaylayin.");
                }

                // IP adresini al
                var ipAddress = GetIpAddress();
                _logger.LogInformation("Processing login for user {UserId} from IP {IpAddress}", user.Id, ipAddress);

                // Kullanicinin mevcut t�m refresh token'larini iptal et (g�venlik i�in)
                await _jwtTokenService.RevokeAllUserRefreshTokens(user.Id, ipAddress);
                _logger.LogInformation("Revoked all existing refresh tokens for user {UserId}", user.Id);

                // Yeni token'lar olustur
                var accessToken = await _jwtTokenService.GenerateToken(user);
                var refreshToken = await _jwtTokenService.GenerateRefreshToken(user.Id, ipAddress);

                if (string.IsNullOrEmpty(accessToken) || refreshToken == null)
                {
                    _logger.LogError("Failed to generate tokens for user {UserId}", user.Id);
                    return ApiResponse<object>.ErrorResponse("Token olusturulamadi. L�tfen tekrar deneyin.");
                }

                _logger.LogInformation("Generated new tokens for user {UserId}. AccessToken length: {AccessTokenLength}, RefreshToken: {RefreshTokenId}", 
                    user.Id, accessToken.Length, refreshToken.Id);

                var tokenResponse = new TokenResponseDto
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken.Token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    TokenType = "Bearer"
                };

                _logger.LogInformation("=== LOGIN SUCCESS === User {UserId} logged in successfully. Token expires at: {ExpiresAt}", 
                    user.Id, tokenResponse.ExpiresAt);

                return ApiResponse<object>.SuccessResponse(tokenResponse, "Giris basarili.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "=== LOGIN ERROR === Error during login for email {Email}. Exception: {ExceptionMessage}", 
                    request.Email, ex.Message);
                return ApiResponse<object>.ErrorResponse("Giris sirasinda bir hata olustu.");
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


