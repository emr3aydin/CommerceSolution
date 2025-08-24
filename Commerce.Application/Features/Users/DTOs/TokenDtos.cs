namespace Commerce.Application.Features.Users.DTOs
{
    public class TokenResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string ExpiresAt { get; set; } = string.Empty; // ISO 8601 string format
        public string TokenType { get; set; } = "Bearer";
    }
}

namespace Commerce.Application.Features.Users.DTOs
{
    public class RefreshTokenDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
