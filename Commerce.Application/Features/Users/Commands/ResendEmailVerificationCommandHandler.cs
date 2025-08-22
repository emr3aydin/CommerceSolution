using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Users.Commands
{
    public class ResendEmailVerificationCommandHandler : IRequestHandler<ResendEmailVerificationCommand, ApiResponse>
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public ResendEmailVerificationCommandHandler(
            UserManager<User> userManager, 
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _context = context;
            _emailService = emailService;
        }

        public async Task<ApiResponse> Handle(ResendEmailVerificationCommand request, CancellationToken cancellationToken)
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

            // Eski kullanılmamış kodları pasif hale getir
            var oldVerifications = await _context.EmailVerifications
                .Where(v => v.UserId == user.Id && !v.IsUsed)
                .ToListAsync();

            foreach (var oldVerification in oldVerifications)
            {
                oldVerification.IsUsed = true;
                oldVerification.UsedAt = DateTime.UtcNow;
            }

            // Yeni doğrulama kodu oluştur
            var verificationCode = GenerateVerificationCode();
            var emailVerification = new EmailVerification
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                VerificationCode = verificationCode,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 dakika geçerli
                IsUsed = false
            };

            _context.EmailVerifications.Add(emailVerification);
            await _context.SaveChangesAsync();

            // Email gönder
            try
            {
                await _emailService.SendEmailVerificationCodeAsync(user.Email, user.FirstName, verificationCode);
                return ApiResponse.SuccessResponse("Doğrulama kodu email adresinize gönderildi.");
            }
            catch (Exception ex)
            {
                // Geliştirme ortamında console'da gösterelim
                Console.WriteLine($"=== EMAIL VERIFICATION CODE (RESEND) ===");
                Console.WriteLine($"User: {user.FirstName} ({user.Email})");
                Console.WriteLine($"Verification Code: {verificationCode}");
                Console.WriteLine($"Email Error: {ex.Message}");
                Console.WriteLine($"========================================");
                
                return ApiResponse.SuccessResponse($"Doğrulama kodu oluşturuldu: {verificationCode} (Email gönderim hatası nedeniyle console'da gösterildi)");
            }
        }

        private string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // 6 haneli kod
        }
    }
}


