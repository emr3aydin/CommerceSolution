using System;
using System.ComponentModel.DataAnnotations;

namespace Commerce.Domain.Entities
{
    public class PasswordResetCode
    {
        public int Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        [StringLength(6)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
        
        // Navigation property
        public virtual User User { get; set; } = null!;
        
        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
        
        public bool IsValid => !IsUsed && !IsExpired;
    }
}
