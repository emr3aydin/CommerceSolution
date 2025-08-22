using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.DTOs
{
    public record CurrentUserDto
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = string.Empty;
        public string UserName { get; init; } = string.Empty;
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public DateTime? DateOfBirth { get; init; }
        public string? Gender { get; init; }
        public string? PhoneNumber { get; init; }
        public bool IsActive { get; init; }
        public DateTime CreatedAt { get; init; }
        public IList<string> Roles { get; init; } = new List<string>();
    }
}
