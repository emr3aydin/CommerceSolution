using Commerce.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Persistence
{
    public class ApplicationUserRole : IdentityUserRole<Guid>
    {
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public virtual ApplicationRole Role { get; set; }
        public virtual User User { get; set; }
    }
}
