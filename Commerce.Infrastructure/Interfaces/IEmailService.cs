using System.Threading.Tasks;

namespace Commerce.Infrastructure.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetCodeAsync(string toEmail, string toName, string resetCode);
        Task SendWelcomeEmailAsync(string toEmail, string toName);
        Task SendGenericEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
        
        // Email verification
        Task SendEmailVerificationCodeAsync(string toEmail, string toName, string verificationCode);
        
        // Order related emails
        Task SendOrderConfirmationEmailAsync(string toEmail, string toName, string orderNumber, decimal totalAmount, DateTime orderDate);
        Task SendOrderStatusUpdateEmailAsync(string toEmail, string toName, string orderNumber, string oldStatus, string newStatus);
        Task SendOrderShippedEmailAsync(string toEmail, string toName, string orderNumber, string shippingAddress);
        Task SendOrderDeliveredEmailAsync(string toEmail, string toName, string orderNumber);
        Task SendOrderCancelledEmailAsync(string toEmail, string toName, string orderNumber, string reason);
    }
}
