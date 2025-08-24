using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Users.Commands
{
    public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, ApiResponse>
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;

        public VerifyEmailCommandHandler(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<ApiResponse> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            // Kullanıcıyı bul
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return ApiResponse.ErrorResponse("Kullanıcı bulunamadı.");
            }

            // Zaten aktif mi kontrol et
            if (user.IsActive)
            {
                return ApiResponse.ErrorResponse("Bu hesap zaten aktif durumda.");
            }

            // Doğrulama kodunu bul
            var verification = await _context.EmailVerifications
                .Where(v => v.UserId == user.Id && 
                           v.VerificationCode == request.VerificationCode && 
                           !v.IsUsed && 
                           v.ExpiresAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (verification == null)
            {
                return ApiResponse.ErrorResponse("Geçersiz veya süresi dolmuş doğrulama kodu.");
            }

            // Doğrulama kodunu kullanıldı olarak işaretle
            verification.IsUsed = true;
            verification.UsedAt = DateTime.UtcNow;

            // Kullanıcıyı aktif yap
            user.IsActive = true;

            // Email doğrulamasını tamamla
            var emailConfirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            await _userManager.ConfirmEmailAsync(user, emailConfirmationToken);

            await _context.SaveChangesAsync();

            return ApiResponse.SuccessResponse("Email doğrulaması tamamlandı. Hesabınız aktif hale getirildi.");
        }
    }
}


