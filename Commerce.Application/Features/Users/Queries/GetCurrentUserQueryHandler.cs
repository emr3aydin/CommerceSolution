using Commerce.Application.Features.Users.DTOs;
using Commerce.Domain;
using Commerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Queries
{
    public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, ApiResponse<CurrentUserDto>>
    {
        private readonly UserManager<User> _userManager;

        public GetCurrentUserQueryHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ApiResponse<CurrentUserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return ApiResponse<CurrentUserDto>.ErrorResponse("Kullanıcı bulunamadı.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var userResponseDto = new CurrentUserDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                PhoneNumber = user.PhoneNumber,
                Roles = roles
            };

            return ApiResponse<CurrentUserDto>.SuccessResponse(userResponseDto, "Kullanıcı bilgileri başarıyla getirildi.");
        }
    }
}
