using Commerce.Domain.Entities;
using Commerce.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<User, ApplicationRole, Guid, IdentityUserClaim<Guid>, ApplicationUserRole, IdentityUserLogin<Guid>, IdentityRoleClaim<Guid>, IdentityUserToken<Guid>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IServiceScopeFactory? _serviceScopeFactory;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor, IServiceScopeFactory? serviceScopeFactory = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
            _serviceScopeFactory = serviceScopeFactory;
        }


        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<PasswordResetCode> PasswordResetCodes { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<EmailVerification> EmailVerifications { get; set; }


        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Debug: SaveChanges çağrıldığını kontrol et
            Console.WriteLine($"SaveChangesAsync called - ServiceScopeFactory is {(_serviceScopeFactory == null ? "NULL" : "NOT NULL")}");
            
            // Değişiklikleri veritabanına göndermeden önce log kayıtlarını hazırla
            var logEntries = OnBeforeSaveChanges();

            Console.WriteLine($"Generated {logEntries.Count} log entries");

            // Asıl değişiklikleri kaydet
            var result = await base.SaveChangesAsync(cancellationToken);

            // Sonra asenkron olarak log kayıtlarını kaydet
            if (_serviceScopeFactory != null && logEntries.Any())
            {
                Console.WriteLine($"Starting to save {logEntries.Count} audit logs");
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await SaveAuditLogsAsync(logEntries);
                        Console.WriteLine("Audit logs saved successfully");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error saving audit logs: {ex.Message}");
                    }
                });
            }

            return result;
        }

        private async Task SaveAuditLogsAsync(List<Log> logEntries)
        {
            if (_serviceScopeFactory == null) return;

            using var scope = _serviceScopeFactory.CreateScope();
            var loggingService = scope.ServiceProvider.GetRequiredService<ILoggingService>();

            foreach (var logEntry in logEntries)
            {
                var properties = JsonSerializer.Deserialize<Dictionary<string, object>>(logEntry.Properties ?? "{}");
                if (properties == null) continue;
                
                await loggingService.LogDatabaseAuditAsync(
                    properties.TryGetValue("ActionType", out var action) ? action?.ToString() ?? "" : "",
                    properties.TryGetValue("EntityType", out var entityType) ? entityType?.ToString() ?? "" : "",
                    properties.TryGetValue("PrimaryKey", out var primaryKey) ? primaryKey?.ToString() ?? "" : "",
                    properties.TryGetValue("UserId", out var userId) ? userId?.ToString() : null,
                    properties.TryGetValue("OldValues", out var oldValues) ? oldValues : null,
                    properties.TryGetValue("NewValues", out var newValues) ? newValues : null,
                    properties.TryGetValue("ChangedColumns", out var changedColumns) ? changedColumns : null
                );
            }
        }

        private List<Log> OnBeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var logEntries = new List<Log>();
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            Console.WriteLine($"OnBeforeSaveChanges - UserId: {userId ?? "NULL"}");
            Console.WriteLine($"Tracked entities count: {ChangeTracker.Entries().Count()}");

            foreach (var entry in ChangeTracker.Entries())
            {
                Console.WriteLine($"Entity: {entry.Entity.GetType().Name}, State: {entry.State}");

                // Takip edilmeyen, durumu değişmemiş veya Log entity'sinin kendisi ise atla
                if (entry.Entity is Log || entry.State is EntityState.Detached or EntityState.Unchanged)
                {
                    Console.WriteLine($"Skipping {entry.Entity.GetType().Name} - Log entity or unchanged");
                    continue;
                }

                Console.WriteLine($"Processing {entry.Entity.GetType().Name} for logging");

                var entityType = entry.Entity.GetType().Name;
                var actionType = entry.State.ToString(); // Added, Modified, Deleted

                var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue?.ToString() ?? "N/A";

                var logEntry = new Log
                {
                    Level = "Information", // Denetim logları için genellikle "Information" seviyesi kullanılır
                    Timestamp = DateTime.UtcNow,
                    MessageTemplate = "Database Audit: {ActionType} on {EntityType} with ID {PrimaryKey} by User {UserId}",
                    Message = $"Database Audit: {actionType} on {entityType} with ID {primaryKey} by User {(userId ?? "System")}",
                };

                var oldValues = new Dictionary<string, object>();
                var newValues = new Dictionary<string, object>();
                var changedColumns = new List<string>();

                switch (entry.State)
                {
                    case EntityState.Added:
                        foreach (var property in entry.Properties)
                        {
                            newValues[property.Metadata.Name] = property.CurrentValue ?? "";
                        }
                        break;

                    case EntityState.Deleted:
                        foreach (var property in entry.Properties)
                        {
                            oldValues[property.Metadata.Name] = property.OriginalValue ?? "";
                        }
                        break;

                    case EntityState.Modified:
                        foreach (var property in entry.Properties.Where(p => p.IsModified))
                        {
                            // Bir referans ID'si değişmediyse bile IsModified=true olabilir, bunu kontrol edelim
                            if (property.OriginalValue?.Equals(property.CurrentValue) == true) continue;

                            changedColumns.Add(property.Metadata.Name);
                            oldValues[property.Metadata.Name] = property.OriginalValue ?? "";
                            newValues[property.Metadata.Name] = property.CurrentValue ?? "";
                        }
                        // Eğer gerçekten değişen bir kolon yoksa bu logu atla
                        if (!changedColumns.Any()) continue;
                        break;
                }

                // Tüm zengin veriyi "Properties" alanına JSON olarak serileştir
                var auditProperties = new
                {
                    LogType = "DatabaseAudit",
                    UserId = userId,
                    EntityType = entityType,
                    ActionType = actionType,
                    PrimaryKey = primaryKey,
                    OldValues = oldValues.Any() ? oldValues : null,
                    NewValues = newValues.Any() ? newValues : null,
                    ChangedColumns = changedColumns.Any() ? changedColumns : null
                };

                logEntry.Properties = JsonSerializer.Serialize(auditProperties, new JsonSerializerOptions { WriteIndented = false }); // DB'de az yer kaplaması için false

                logEntries.Add(logEntry);
            }

            return logEntries;
        }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });
                userRole
                    .HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
                userRole
                    .HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();
                userRole.Property(ur => ur.AssignedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            }
                
                );
            builder.Entity<Cart>()
            .HasIndex(c => c.UserId)
            .IsUnique();

            builder.Entity<CartItem>().HasIndex(c => new { c.CartId, c.ProductId }).IsUnique();

            builder.Entity<Order>().HasIndex(c=> c.OrderNumber).IsUnique();

            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }


    }
}
