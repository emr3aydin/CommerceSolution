using Commerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Interfaces
{
    public interface IJwtTokenService
    {
        Task<string> GenerateToken(User user);
    }
}
