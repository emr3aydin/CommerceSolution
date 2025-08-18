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
                    Message = $"Operation: {action} performed on {entityType} with ID: {entityId}",
                    MessageTemplate = "Operation: {Action} performed on {EntityType} with ID {EntityId}",
                    Level = "Information",
                    Timestamp = DateTime.UtcNow,
                    Properties = JsonSerializer.Serialize(new
                    {
                        LogType = "Operation",
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
                    MessageTemplate = "Error: {Message}",
                    Level = "Error",
                    Timestamp = DateTime.UtcNow,
                    Exception = exception?.ToString(),
                    Properties = JsonSerializer.Serialize(new
                    {
                        LogType = "Error",
                        UserId = userId,
                        AdditionalData = additionalData,
                        ExceptionType = exception?.GetType().Name,
                        StackTrace = exception?.StackTrace,
                        InnerException = exception?.InnerException?.Message,
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

        public async Task LogDatabaseAuditAsync(string action, string entityType, string entityId, string? userId = null, object? oldValues = null, object? newValues = null, object? changedColumns = null)
        {
            try
            {
                var logEntry = new Log
                {
                    Message = $"Database Audit: {action} on {entityType} with ID: {entityId}",
                    MessageTemplate = "Database Audit: {Action} on {EntityType} with ID {EntityId}",
                    Level = "Information",
                    Timestamp = DateTime.UtcNow,
                    Properties = JsonSerializer.Serialize(new
                    {
                        LogType = "DatabaseAudit",
                        Action = action,
                        EntityType = entityType,
                        EntityId = entityId,
                        UserId = userId,
                        OldValues = oldValues,
                        NewValues = newValues,
                        ChangedColumns = changedColumns,
                        Timestamp = DateTime.UtcNow
                    })
                };

                await _logDbContext.Logs.AddAsync(logEntry);
                await _logDbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while logging database audit to database");
            }
        }
    }
}
