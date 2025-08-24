using Commerce.Application.Features.Users.Commands;
using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Interfaces;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace Commerce.Application.Features.Users.Commands
{
    public class SendPasswordResetCodeCommandHandler : IRequestHandler<SendPasswordResetCodeCommand, ApiResponse<bool>>
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<SendPasswordResetCodeCommandHandler> _logger;

        public SendPasswordResetCodeCommandHandler(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<SendPasswordResetCodeCommandHandler> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<ApiResponse<bool>> Handle(SendPasswordResetCodeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Kullanıcıyı bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

                if (user == null)
                {
                    // Güvenlik için email bulunamadı mesajı verme
                    return ApiResponse<bool>.SuccessResponse(true, "Eğer email adresiniz sistemde kayıtlıysa, şifre sıfırlama kodu gönderildi.");
                }

                // Rate limiting: Son 1 dakikada kod gönderilmiş mi?
                var recentCode = await _context.PasswordResetCodes
                    .Where(prc => prc.UserId == user.Id && prc.CreatedAt > DateTime.UtcNow.AddMinutes(-1))
                    .FirstOrDefaultAsync(cancellationToken);

                if (recentCode != null)
                {
                    return ApiResponse<bool>.ErrorResponse("Lütfen 1 dakika bekleyip tekrar deneyin.");
                }

                // Eski kodları geçersiz kıl
                var oldCodes = await _context.PasswordResetCodes
                    .Where(prc => prc.UserId == user.Id && !prc.IsUsed)
                    .ToListAsync(cancellationToken);

                foreach (var oldCode in oldCodes)
                {
                    oldCode.IsUsed = true;
                    oldCode.UsedAt = DateTime.UtcNow;
                }

                // Yeni 6 haneli kod üret
                var resetCode = GenerateSecureCode();

                // Yeni kod kaydı oluştur
                var passwordResetCode = new PasswordResetCode
                {
                    UserId = user.Id,
                    Code = resetCode,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 dakika geçerli
                    IsUsed = false
                };

                _context.PasswordResetCodes.Add(passwordResetCode);
                await _context.SaveChangesAsync(cancellationToken);

                // Email gönder
                await _emailService.SendPasswordResetCodeAsync(user.Email!, $"{user.FirstName} {user.LastName}", resetCode);

                _logger.LogInformation("Password reset code sent to user {UserId}", user.Id);

                return ApiResponse<bool>.SuccessResponse(true, "Şifre sıfırlama kodu email adresinize gönderildi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset code for email {Email}", request.Email);
                return ApiResponse<bool>.ErrorResponse("Şifre sıfırlama kodu gönderilirken bir hata oluştu.");
            }
        }

        private string GenerateSecureCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var randomNumber = Math.Abs(BitConverter.ToInt32(bytes, 0));
            return (randomNumber % 1000000).ToString("D6"); // 6 haneli kod
        }
    }

    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ApiResponse<bool>>
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<ResetPasswordCommandHandler> _logger;

        public ResetPasswordCommandHandler(
            ApplicationDbContext context,
            UserManager<User> userManager,
            ILogger<ResetPasswordCommandHandler> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<ApiResponse<bool>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Password reset attempt for email: {Email}, Code: {Code}", request.Email, request.Code);

                // Kullanıcıyı bul
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

                if (user == null)
                {
                    _logger.LogWarning("User not found for email: {Email}", request.Email);
                    return ApiResponse<bool>.ErrorResponse("Geçersiz email adresi.");
                }

                _logger.LogInformation("User found: {UserId}", user.Id);

                // Geçerli kodu bul
                var resetCode = await _context.PasswordResetCodes
                    .Where(prc => prc.UserId == user.Id && 
                                  prc.Code == request.Code && 
                                  !prc.IsUsed && 
                                  prc.ExpiresAt > DateTime.UtcNow)
                    .FirstOrDefaultAsync(cancellationToken);

                if (resetCode == null)
                {
                    // Daha detaylı hata ayıklama için tüm kodları kontrol et
                    var allCodes = await _context.PasswordResetCodes
                        .Where(prc => prc.UserId == user.Id)
                        .ToListAsync(cancellationToken);

                    _logger.LogWarning("Reset code not found. User: {UserId}, RequestedCode: {Code}, AllCodes: {@Codes}", 
                        user.Id, request.Code, allCodes.Select(c => new { c.Code, c.IsUsed, c.ExpiresAt, c.CreatedAt }));

                    return ApiResponse<bool>.ErrorResponse("Geçersiz veya süresi dolmuş kod.");
                }

                _logger.LogInformation("Valid reset code found: {CodeId}", resetCode.Id);

                // Şifreyi sıfırla
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogError("Password reset failed for user {UserId}. Errors: {Errors}", user.Id, errors);
                    return ApiResponse<bool>.ErrorResponse($"Şifre sıfırlama başarısız: {errors}");
                }

                // Kodu kullanıldı olarak işaretle
                resetCode.IsUsed = true;
                resetCode.UsedAt = DateTime.UtcNow;

                // Kullanıcının diğer tüm kodlarını da geçersiz kıl
                var otherCodes = await _context.PasswordResetCodes
                    .Where(prc => prc.UserId == user.Id && !prc.IsUsed)
                    .ToListAsync(cancellationToken);

                foreach (var code in otherCodes)
                {
                    code.IsUsed = true;
                    code.UsedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Password reset successful for user {UserId}", user.Id);

                return ApiResponse<bool>.SuccessResponse(true, "Şifreniz başarıyla sıfırlandı.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email {Email}. Exception details: {Message}, StackTrace: {StackTrace}", 
                    request.Email, ex.Message, ex.StackTrace);
                return ApiResponse<bool>.ErrorResponse($"Şifre sıfırlama sırasında bir hata oluştu: {ex.Message}");
            }
        }
    }

    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, ApiResponse<bool>>
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger<ChangePasswordCommandHandler> _logger;

        public ChangePasswordCommandHandler(
            UserManager<User> userManager,
            ILogger<ChangePasswordCommandHandler> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<ApiResponse<bool>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(request.UserId);
                if (user == null)
                {
                    return ApiResponse<bool>.ErrorResponse("Kullanıcı bulunamadı.");
                }

                var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return ApiResponse<bool>.ErrorResponse($"Şifre değiştirme başarısız: {errors}");
                }

                _logger.LogInformation("Password changed successfully for user {UserId}", user.Id);

                return ApiResponse<bool>.SuccessResponse(true, "Şifreniz başarıyla değiştirildi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", request.UserId);
                return ApiResponse<bool>.ErrorResponse("Şifre değiştirme sırasında bir hata oluştu.");
            }
        }
    }
}


