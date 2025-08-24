using Commerce.Core.Common;
using Commerce.Domain.Entities;
using Commerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Commerce.Application.Features.Users.Commands
{
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, ApiResponse>
    {
        private readonly UserManager<User> _userManager;

        public UpdateProfileCommandHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ApiResponse> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return ApiResponse.ErrorResponse("Kullanıcı bulunamadı.");
            }

            // Kullanıcı bilgilerini güncelle
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.DateOfBirth = request.DateOfBirth;
            user.Gender = request.Gender;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ApiResponse.ErrorResponse($"Profil güncellenirken bir hata oluştu: {errors}");
            }

            return ApiResponse.SuccessResponse("Profil başarıyla güncellendi.");
        }
    }
}


