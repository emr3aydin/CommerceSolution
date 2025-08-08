using Commerce.Domain.Entities;
using Commerce.Infrastructure.Interfaces;
using Commerce.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Services
{
    public class LoggingService : ILoggingService
    {
        private readonly LogDbContext _logDbContext;
        private readonly ILogger<LoggingService> _logger;

        public LoggingService(LogDbContext logDbContext, ILogger<LoggingService> logger)
        {
            _logDbContext = logDbContext;
            _logger = logger;
        }

        public async Task LogOperationAsync(string action, string entityType, object entityId, string? userId = null, object? additionalData = null)
        {
            try
            {
                var logEntry = new Log
                {
                    Message = $"{action} operation performed on {entityType} with ID: {entityId}",
                    Level = "Information",
                    Timestamp = DateTime.UtcNow,
                    Properties = JsonSerializer.Serialize(new
                    {
                        Action = action,
                        EntityType = entityType,
                        EntityId = entityId,
                        UserId = userId,
                        AdditionalData = additionalData,
                        Timestamp = DateTime.UtcNow
                    })
                };

                await _logDbContext.Logs.AddAsync(logEntry);
                await _logDbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while logging operation to database");
            }
        }

        public async Task LogErrorAsync(string message, Exception? exception = null, string? userId = null, object? additionalData = null)
        {
            try
            {
                var logEntry = new Log
                {
                    Message = message,
                    Level = "Error",
                    Timestamp = DateTime.UtcNow,
                    Exception = exception?.ToString(),
                    Properties = JsonSerializer.Serialize(new
                    {
                        UserId = userId,
                        AdditionalData = additionalData,
                        Timestamp = DateTime.UtcNow
                    })
                };

                await _logDbContext.Logs.AddAsync(logEntry);
                await _logDbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while logging error to database");
            }
        }
    }
}
