using System.Threading.Tasks;

namespace Commerce.Infrastructure.Interfaces
{
    public interface ILoggingService
    {
        Task LogOperationAsync(string action, string entityType, object entityId, string? userId = null, object? additionalData = null);
        Task LogErrorAsync(string message, Exception? exception = null, string? userId = null, object? additionalData = null);
    }
}
