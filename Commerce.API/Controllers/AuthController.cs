using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR.NotificationPublishers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace Commerce.API.Controllers
{
    [ApiController]
    public class AuthController :ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<ApplicationRole> _roleManager;

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration, RoleManager<ApplicationRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _roleManager = roleManager;
        }
        public record RegisterDto(string Email, string Username, string Password, string FirstName, string LastName, DateTime DateOfBirth, string Gender, string PhoneNumber);
        public record LoginDto(string Email, string Password);

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Username,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                DateOfBirth = registerDto.DateOfBirth,
                Gender = registerDto.Gender,
                IsActive = false,
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = registerDto.PhoneNumber

            };
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if(!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            if (!await _roleManager.RoleExistsAsync("Customer"))
            {
                await _roleManager.CreateAsync(new ApplicationRole("Customer"));
            }
            await _userManager.AddToRoleAsync(user, "Customer");

            return Ok(new { Message = "Kullanıcı başarı ile oluşturuldu." });

        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            User user = null; 


            bool isEmail = Regex.IsMatch(loginDto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

            if (isEmail)
            {
                user = await _userManager.FindByEmailAsync(loginDto.Email);
            }
            else
            {
                user = await _userManager.FindByNameAsync(loginDto.Email);
            }

            if (user == null)
            {
                return Unauthorized("Geçersiz kullanıcı adı/email veya şifre.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Geçersiz kullanıcı adı/email veya şifre.");
            }

            var token = await GenerateJwtToken(user);
            return Ok(new { Token = token });

        }

        private async Task<string> GenerateJwtToken(User user)
        {
            // Replace this line:
            // var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration!));

            // With this:
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),


            };
            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role,role));
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
