using Commerce.Domain;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
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

        public RegisterUserCommandHandler(UserManager<User> userManager, RoleManager<ApplicationRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
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
                return ApiResponse.ErrorResponse($"Kullanıcı oluşturulurken bir hata oluştu: {errors}");
            }

            if (!await _roleManager.RoleExistsAsync("Customer"))
            {
                await _roleManager.CreateAsync(new ApplicationRole("Customer"));
            }

            await _userManager.AddToRoleAsync(user, "Customer");

            return ApiResponse.SuccessResponse("Kullanıcı başarı ile oluşturuldu.");
        }
    }
    }
