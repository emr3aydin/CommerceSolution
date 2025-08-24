namespace Commerce.Application.Features.Users.DTOs
{
    public class VerifyEmailDto
    {
        public string Email { get; set; } = null!;
        public string VerificationCode { get; set; } = null!;
    }
}
