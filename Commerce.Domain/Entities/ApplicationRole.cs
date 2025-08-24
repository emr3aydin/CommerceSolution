using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Domain.Entities
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public ApplicationRole() : base()
        {
        }
        public ApplicationRole(string roleName) : base(roleName)
        {
            
        }
        public string? Description { get; set; }

        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>(); 
    }
}
