using Commerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Interfaces
{
    public interface IJwtTokenService
    {
        Task<string> GenerateToken(User user);
        Task<RefreshToken> GenerateRefreshToken(Guid userId, string ipAddress);
        Task<bool> ValidateRefreshToken(string token);
        Task<User?> GetUserByRefreshToken(string token);
        Task RevokeRefreshToken(string token, string ipAddress, string? replacedByToken = null);
        Task RevokeAllUserRefreshTokens(Guid userId, string ipAddress);
    }
}
