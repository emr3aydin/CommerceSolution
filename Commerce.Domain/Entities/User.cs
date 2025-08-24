using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;


namespace Commerce.Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;

        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }
        public bool IsActive { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }


        public virtual Cart? Cart { get; set; }
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();



    }
}
