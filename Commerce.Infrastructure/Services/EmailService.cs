using Commerce.Infrastructure.Configuration;
using Commerce.Infrastructure.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Commerce.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task SendPasswordResetCodeAsync(string toEmail, string toName, string resetCode)
        {
            var subject = "Şifre Sıfırlama Kodu - Commerce System";
            var body = GeneratePasswordResetEmailBody(toName, resetCode);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string toName)
        {
            var subject = "Hoş Geldiniz - Commerce System";
            var body = GenerateWelcomeEmailBody(toName);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendGenericEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort);
                
                // MailerSend için özel ayarlar
                client.EnableSsl = _emailSettings.EnableSsl;
                client.UseDefaultCredentials = false;
                
                // MailerSend authentication - Email adresi username olarak kullanılır
                client.Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword);
                
                // TLS ayarları
                client.DeliveryMethod = SmtpDeliveryMethod.Network;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }
        }

        private string GeneratePasswordResetEmailBody(string userName, string resetCode)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Şifre Sıfırlama</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #333; text-align: center;'>Şifre Sıfırlama Kodu</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;'>
            <h1 style='color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;'>{resetCode}</h1>
        </div>
        
        <p><strong>Önemli:</strong></p>
        <ul>
            <li>Bu kod 15 dakika süreyle geçerlidir</li>
            <li>Kod yalnızca bir kez kullanılabilir</li>
            <li>Bu işlemi siz yapmadıysanız, bu emaili göz ardı edin</li>
        </ul>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
        </p>
    </div>
</body>
</html>";
        }

        private string GenerateWelcomeEmailBody(string userName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Hoş Geldiniz</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #333; text-align: center;'>Commerce System'e Hoş Geldiniz!</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Hesabınız başarıyla oluşturuldu. Artık tüm özelliklerimizden yararlanabilirsiniz.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='#' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Alışverişe Başla
            </a>
        </div>
        
        <p>İyi alışverişler dileriz!</p>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Commerce System Ekibi
        </p>
    </div>
</body>
</html>";
        }
    }
}
