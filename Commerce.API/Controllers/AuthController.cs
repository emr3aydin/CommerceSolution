
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
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
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
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
        public record CreateAdminDto(string Email, string Username, string Password, string FirstName, string LastName, DateTime DateOfBirth, string Gender, string PhoneNumber);

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

            if (!result.Succeeded)
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
            User? user = null;

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

        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")] // Sadece mevcut adminler yeni admin oluşturabilir
        public async Task<IActionResult> CreateAdmin(CreateAdminDto createAdminDto)
        {
            var user = new User
            {
                UserName = createAdminDto.Username,
                Email = createAdminDto.Email,
                FirstName = createAdminDto.FirstName,
                LastName = createAdminDto.LastName,
                DateOfBirth = createAdminDto.DateOfBirth,
                Gender = createAdminDto.Gender,
                IsActive = true, // Admin kullanıcıları aktif olarak başlar
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = createAdminDto.PhoneNumber
            };
            
            var result = await _userManager.CreateAsync(user, createAdminDto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            
            // Admin rolünü oluştur (yoksa)
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new ApplicationRole("Admin"));
            }
            
            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok(new { Message = "Admin kullanıcısı başarıyla oluşturuldu." });
        }

        [HttpPost("init-admin")]
        public async Task<IActionResult> InitializeAdmin(CreateAdminDto createAdminDto)
        {
            // Sistem admin'i yoksa ilk admin'i oluşturmak için
            var existingAdmins = await _userManager.GetUsersInRoleAsync("Admin");
            if (existingAdmins.Any())
            {
                return BadRequest("Sistem zaten admin kullanıcısına sahip.");
            }

            var user = new User
            {
                UserName = createAdminDto.Username,
                Email = createAdminDto.Email,
                FirstName = createAdminDto.FirstName,
                LastName = createAdminDto.LastName,
                DateOfBirth = createAdminDto.DateOfBirth,
                Gender = createAdminDto.Gender,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = createAdminDto.PhoneNumber
            };
            
            var result = await _userManager.CreateAsync(user, createAdminDto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            
            // Admin rolünü oluştur
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new ApplicationRole("Admin"));
            }
            
            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok(new { Message = "İlk admin kullanıcısı başarıyla oluşturuldu." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                user.FirstName,
                user.LastName,
                user.DateOfBirth,
                user.Gender,
                user.PhoneNumber,
                Roles = roles
            });
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
