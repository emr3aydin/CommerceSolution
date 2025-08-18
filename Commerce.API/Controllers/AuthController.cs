using Commerce.Application.Features.Users.Commands; 
using Commerce.Application.Features.Users.Queries; 
using Commerce.Application.Features.Users.DTOs; 
using Commerce.Domain;
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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(ApiResponse.ErrorResponse("Kullanıcı kimliği bulunamadı."));
            }

            var query = new GetCurrentUserQuery(userId);
            var response = await _mediator.Send(query);

            if (!response.Success)
            {
                if (response.Message == "Kullanıcı bulunamadı.")
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
                return Unauthorized(ApiResponse.ErrorResponse("Kullanıcı kimliği bulunamadı."));
            }

            var command = new ChangePasswordCommand(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
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
    }
}