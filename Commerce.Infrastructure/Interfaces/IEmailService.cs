using System.Threading.Tasks;

namespace Commerce.Infrastructure.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetCodeAsync(string toEmail, string toName, string resetCode);
        Task SendWelcomeEmailAsync(string toEmail, string toName);
        Task SendGenericEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
    }
}
