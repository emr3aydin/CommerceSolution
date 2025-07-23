using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Persistence
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public string? Description { get; set; }

        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } 
    }
}
