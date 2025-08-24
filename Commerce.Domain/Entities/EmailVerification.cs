using System;

namespace Commerce.Domain.Entities
{
    public class EmailVerification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string VerificationCode { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}
