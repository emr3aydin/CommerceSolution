using Commerce.Domain;
using Commerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Commands
{
    public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, ApiResponse<object>>
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;

        public LoginUserCommandHandler(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        public async Task<ApiResponse<object>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
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

            var token = await GenerateJwtToken(user);
            return ApiResponse<object>.SuccessResponse(new { Token = token }, "Giriş başarılı.");
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is not configured");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
