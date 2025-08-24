using System.Threading.Tasks;

namespace Commerce.Infrastructure.Interfaces
{
    public interface ILoggingService
    {
        // Manuel operasyon logları için
        Task LogOperationAsync(string action, string entityType, object entityId, string? userId = null, object? additionalData = null);
        
        // Hata logları için
        Task LogErrorAsync(string message, Exception? exception = null, string? userId = null, object? additionalData = null);
        
        // Veritabanı audit logları için (ApplicationDbContext tarafından kullanılacak)
        Task LogDatabaseAuditAsync(string action, string entityType, string entityId, string? userId = null, object? oldValues = null, object? newValues = null, object? changedColumns = null);
    }
}
