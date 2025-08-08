using Commerce.Domain;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IServiceProvider  _serviceProvider;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IServiceProvider serviceProvider)
    {

        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Beklenmeyen bir hata oluştu: {Message}", exception.Message);

        await LogExceptionToDatabaseAsync(exception, httpContext);

        var problemDetails = new ProblemDetails { 
        Status = StatusCodes.Status500InternalServerError,
        Title = "Sunucu Hatası",
        Detail = "İşleminiz sırasında beklenmeyen bir hata oluştu. Lütfen daha sonra yeniden deneyin"
        };

        var response = ApiResponse.ErrorResponse;

        httpContext.Response.ContentType = "application/json";
        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        return true; 
    }

    private async Task LogExceptionToDatabaseAsync(Exception exception, HttpContext httpContext)
    {
        try
        {
            await using var scope = _serviceProvider.CreateAsyncScope();
            var logDbContext = scope.ServiceProvider.GetRequiredService<LogDbContext>();

            var logEntry = new Log
            {
                Message = exception.Message,
                Level = "Error",
                Timestamp = DateTime.Now,
                Exception = exception.ToString(),
                Properties = JsonSerializer.Serialize(new
                {
                    RequestPath = httpContext.Request.Path,
                    RequestMethod = httpContext.Request.Method
                })
            };

            await logDbContext.Logs.AddAsync(logEntry);
            await logDbContext.SaveChangesAsync();

        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "Hatanın veritabanına loglanması sırasında bir hata oluştu");
        }
    }


}