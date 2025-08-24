using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Core.Constants;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Commands
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, ApiResponse>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public RegisterUserCommandHandler(
            UserManager<User> userManager, 
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _emailService = emailService;
        }

        public async Task<ApiResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                IsActive = false,
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = request.PhoneNumber
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ApiResponse.ErrorResponse($"Kullanici olusturulurken bir hata olustu: {errors}");
            }

            if (!await _roleManager.RoleExistsAsync("Customer"))
            {
                await _roleManager.CreateAsync(new ApplicationRole("Customer"));
            }

            await _userManager.AddToRoleAsync(user, "Customer");

            // Email dogrulama kodu olustur ve g�nder
            var verificationCode = GenerateVerificationCode();
            var emailVerification = new EmailVerification
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                VerificationCode = verificationCode,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 dakika ge�erli
                IsUsed = false
            };

            _context.EmailVerifications.Add(emailVerification);
            await _context.SaveChangesAsync();

            // Email g�nder
            try
            {
                await _emailService.SendEmailVerificationCodeAsync(user.Email, user.FirstName, verificationCode);
            }
            catch (Exception ex)
            {
                // Email g�nderme hatasi olsa bile kayit tamamlandi
                // Gelistirme ortaminda console'da g�sterelim
                Console.WriteLine($"=== EMAIL VERIFICATION CODE ===");
                Console.WriteLine($"User: {user.FirstName} ({user.Email})");
                Console.WriteLine($"Verification Code: {verificationCode}");
                Console.WriteLine($"Email Error: {ex.Message}");
                Console.WriteLine($"================================");
            }

            return ApiResponse.SuccessResponse("Kullanici basari ile olusturuldu. Email adresinize g�nderilen dogrulama kodunu girerek hesabinizi aktiflestirin.");
        }

        private string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // 6 haneli kod
        }
    }
}


