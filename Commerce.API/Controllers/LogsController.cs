using Commerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class LogsController : ControllerBase
    {
        private readonly LogDbContext _logDbContext;

        public LogsController(LogDbContext logDbContext)
        {
            _logDbContext = logDbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs(
            [FromQuery] string? level = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _logDbContext.Logs.AsQueryable();

                // Filter by level if provided
                if (!string.IsNullOrEmpty(level))
                {
                    query = query.Where(l => l.Level == level);
                }

                // Filter by date range if provided
                if (startDate.HasValue)
                {
                    query = query.Where(l => l.Timestamp >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(l => l.Timestamp <= endDate.Value);
                }

                // Order by timestamp descending (newest first)
                query = query.OrderByDescending(l => l.Timestamp);

                // Calculate total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var logs = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(l => new
                    {
                        l.Id,
                        l.Message,
                        l.Level,
                        l.Timestamp,
                        l.Exception,
                        l.Properties
                    })
                    .ToListAsync();

                var response = new
                {
                    Data = logs,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(ApiResponse<object>.SuccessResponse(response, "Loglar başarıyla getirildi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Loglar getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLogById(int id)
        {
            try
            {
                var log = await _logDbContext.Logs
                    .Where(l => l.Id == id)
                    .Select(l => new
                    {
                        l.Id,
                        l.Message,
                        l.Level,
                        l.Timestamp,
                        l.Exception,
                        l.Properties
                    })
                    .FirstOrDefaultAsync();

                if (log == null)
                {
                    return NotFound(ApiResponse.ErrorResponse("Log bulunamadı."));
                }

                return Ok(ApiResponse<object>.SuccessResponse(log, "Log başarıyla getirildi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Log getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetLogStats()
        {
            try
            {
                var today = DateTime.Today;
                var thisWeek = today.AddDays(-(int)today.DayOfWeek);
                var thisMonth = new DateTime(today.Year, today.Month, 1);

                var stats = new
                {
                    TotalLogs = await _logDbContext.Logs.CountAsync(),
                    ErrorLogs = await _logDbContext.Logs.CountAsync(l => l.Level == "Error"),
                    TodayLogs = await _logDbContext.Logs.CountAsync(l => l.Timestamp >= today),
                    ThisWeekLogs = await _logDbContext.Logs.CountAsync(l => l.Timestamp >= thisWeek),
                    ThisMonthLogs = await _logDbContext.Logs.CountAsync(l => l.Timestamp >= thisMonth),
                    LevelDistribution = await _logDbContext.Logs
                        .GroupBy(l => l.Level)
                        .Select(g => new { Level = g.Key, Count = g.Count() })
                        .ToListAsync()
                };

                return Ok(ApiResponse<object>.SuccessResponse(stats, "Log istatistikleri başarıyla getirildi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Log istatistikleri getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearOldLogs([FromQuery] int daysToKeep = 30)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
                var logsToDelete = await _logDbContext.Logs
                    .Where(l => l.Timestamp < cutoffDate)
                    .ToListAsync();

                _logDbContext.Logs.RemoveRange(logsToDelete);
                await _logDbContext.SaveChangesAsync();

                return Ok(ApiResponse.SuccessResponse($"{logsToDelete.Count} adet eski log başarıyla temizlendi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Loglar temizlenirken bir hata oluştu: {ex.Message}"));
            }
        }
    }
}
