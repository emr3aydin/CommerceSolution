using Commerce.Application.Features.Users.Commands; 
using Commerce.Application.Features.Users.Queries; 
using Commerce.Application.Features.Users.DTOs; 
using Commerce.Core.Common;
using MediatR; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var command = new RegisterUserCommand(
                registerDto.Email,
                registerDto.Username,
                registerDto.Password,
                registerDto.FirstName,
                registerDto.LastName,
                registerDto.DateOfBirth,
                registerDto.Gender,
                registerDto.PhoneNumber
            );
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var command = new LoginUserCommand(loginDto.Email, loginDto.Password);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return Unauthorized(response);
            }

            return Ok(response);
        }

        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto createAdminDto)
        {
            var command = new CreateAdminCommand(
                createAdminDto.Email,
                createAdminDto.Username,
                createAdminDto.Password,
                createAdminDto.FirstName,
                createAdminDto.LastName,
                createAdminDto.DateOfBirth,
                createAdminDto.Gender,
                createAdminDto.PhoneNumber
            );
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            // Hem NameIdentifier hem de JWT 'sub' claim'ini dene
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

            if (userId == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Kullanici kimligi bulunamadi."));
            }

            var query = new GetCurrentUserQuery(userId);
            var response = await _mediator.Send(query);

            if (!response.Success)
            {
                if (response.Message == "Kullanici bulunamadi.")
                {
                    return NotFound(response);
                }
                return Unauthorized(response);
            }
            return Ok(response);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var command = new SendPasswordResetCodeCommand(forgotPasswordDto.Email);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var command = new ResetPasswordCommand(resetPasswordDto.Email, resetPasswordDto.Code, resetPasswordDto.NewPassword);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Kullanici kimligi bulunamadi."));
            }

            var command = new ChangePasswordCommand(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Kullanici kimligi bulunamadi."));
            }

            var command = new UpdateProfileCommand(
                userId,
                updateProfileDto.FirstName,
                updateProfileDto.LastName,
                updateProfileDto.PhoneNumber,
                updateProfileDto.DateOfBirth,
                updateProfileDto.Gender
            );

            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            var command = new RefreshTokenCommand(refreshTokenDto.RefreshToken);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            var command = new RevokeTokenCommand(refreshTokenDto.RefreshToken);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            var command = new VerifyEmailCommand(verifyEmailDto.Email, verifyEmailDto.VerificationCode);
            var response = await _mediator.Send(command);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("resend-email-verification")]
        public async Task<IActionResult> ResendEmailVerification([FromBody] ResendEmailVerificationDto resendDto)
        {
            // Kapsamli debug i�in loglar
            Console.WriteLine("=== RESEND EMAIL VERIFICATION ENDPOINT CALLED ===");
            Console.WriteLine($"Request Body DTO: {(resendDto == null ? "NULL" : "NOT NULL")}");
            
            if (resendDto != null)
            {
                Console.WriteLine($"DTO Email: '{resendDto.Email ?? "NULL"}'");
                Console.WriteLine($"DTO Email Length: {resendDto.Email?.Length ?? 0}");
                Console.WriteLine($"DTO Email IsNullOrEmpty: {string.IsNullOrEmpty(resendDto.Email)}");
                Console.WriteLine($"DTO Email IsNullOrWhiteSpace: {string.IsNullOrWhiteSpace(resendDto.Email)}");
            }
            
            // Raw request body'yi de logla
            Request.EnableBuffering();
            Request.Body.Position = 0;
            using var reader = new StreamReader(Request.Body);
            var rawBody = await reader.ReadToEndAsync();
            Console.WriteLine($"Raw Request Body: '{rawBody}'");
            Request.Body.Position = 0;
            
            Console.WriteLine("================================================");
            
            if (resendDto == null || string.IsNullOrWhiteSpace(resendDto.Email))
            {
                Console.WriteLine("VALIDATION FAILED: Email is null or empty");
                return BadRequest(ApiResponse.ErrorResponse("Email adresi gereklidir."));
            }

            try
            {
                var command = new Commerce.Application.Features.Users.Commands.ResendEmailVerificationCommand(resendDto.Email);
                var response = await _mediator.Send(command);

                if (!response.Success)
                {
                    Console.WriteLine($"COMMAND FAILED: {response.Message}");
                    return BadRequest(response);
                }

                Console.WriteLine("COMMAND SUCCESS");
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"EXCEPTION: {ex.Message}");
                return BadRequest(ApiResponse.ErrorResponse($"Bir hata olustu: {ex.Message}"));
            }
        }
    }
}
