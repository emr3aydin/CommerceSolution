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

        public async Task SendEmailVerificationCodeAsync(string toEmail, string toName, string verificationCode)
        {
            var subject = "Email Doğrulama Kodu - Commerce System";
            var body = GenerateEmailVerificationBody(toName, verificationCode);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendOrderConfirmationEmailAsync(string toEmail, string toName, string orderNumber, decimal totalAmount, DateTime orderDate)
        {
            var subject = $"Sipariş Onayı - {orderNumber}";
            var body = GenerateOrderConfirmationEmailBody(toName, orderNumber, totalAmount, orderDate);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendOrderStatusUpdateEmailAsync(string toEmail, string toName, string orderNumber, string oldStatus, string newStatus)
        {
            var subject = $"Sipariş Durumu Güncellendi - {orderNumber}";
            var body = GenerateOrderStatusUpdateEmailBody(toName, orderNumber, oldStatus, newStatus);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendOrderShippedEmailAsync(string toEmail, string toName, string orderNumber, string shippingAddress)
        {
            var subject = $"Siparişiniz Kargoya Verildi - {orderNumber}";
            var body = GenerateOrderShippedEmailBody(toName, orderNumber, shippingAddress);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendOrderDeliveredEmailAsync(string toEmail, string toName, string orderNumber)
        {
            var subject = $"Siparişiniz Teslim Edildi - {orderNumber}";
            var body = GenerateOrderDeliveredEmailBody(toName, orderNumber);
            
            await SendGenericEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendOrderCancelledEmailAsync(string toEmail, string toName, string orderNumber, string reason)
        {
            var subject = $"Sipariş İptal Edildi - {orderNumber}";
            var body = GenerateOrderCancelledEmailBody(toName, orderNumber, reason);
            
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

        private string GenerateEmailVerificationBody(string userName, string verificationCode)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Email Doğrulama</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #333; text-align: center;'>📧 Email Adresinizi Doğrulayın</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Commerce System'e kaydolduğunuz için teşekkür ederiz! Email adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;'>
            <h1 style='color: #28a745; font-size: 32px; letter-spacing: 5px; margin: 0;'>{verificationCode}</h1>
        </div>
        
        <p><strong>Önemli:</strong></p>
        <ul>
            <li>Bu kod 15 dakika süreyle geçerlidir</li>
            <li>Kod yalnızca bir kez kullanılabilir</li>
            <li>Email adresinizi doğruladıktan sonra hesabınız aktif hale gelecek</li>
        </ul>
        
        <p>Email doğrulama işlemini tamamladıktan sonra tüm özelliklerimizden yararlanabilirsiniz.</p>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.<br>
            Commerce System Ekibi
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

        private string GenerateOrderConfirmationEmailBody(string userName, string orderNumber, decimal totalAmount, DateTime orderDate)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Sipariş Onayı</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #28a745; text-align: center;'>✅ Siparişiniz Alındı!</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Siparişiniz başarıyla alınmıştır. Aşağıda sipariş detaylarınızı bulabilirsiniz:</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;'>
            <h3 style='margin-top: 0; color: #333;'>Sipariş Bilgileri</h3>
            <p><strong>Sipariş Numarası:</strong> {orderNumber}</p>
            <p><strong>Sipariş Tarihi:</strong> {orderDate:dd/MM/yyyy HH:mm}</p>
            <p><strong>Toplam Tutar:</strong> <span style='color: #28a745; font-size: 18px; font-weight: bold;'>{totalAmount:C}</span></p>
        </div>
        
        <p>Siparişiniz hazırlanmaya başlandı. Durumu hakkında bilgilendirileceksiniz.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='#' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Sipariş Detaylarını Görüntüle
            </a>
        </div>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Commerce System Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private string GenerateOrderStatusUpdateEmailBody(string userName, string orderNumber, string oldStatus, string newStatus)
        {
            var statusIcon = newStatus switch
            {
                "Confirmed" => "✅",
                "Shipped" => "🚚",
                "Delivered" => "📦",
                "Cancelled" => "❌",
                _ => "📋"
            };

            var statusColor = newStatus switch
            {
                "Confirmed" => "#28a745",
                "Shipped" => "#007bff",
                "Delivered" => "#28a745",
                "Cancelled" => "#dc3545",
                _ => "#6c757d"
            };

            var statusText = newStatus switch
            {
                "Pending" => "Beklemede",
                "Confirmed" => "Onaylandı",
                "Shipped" => "Kargoya Verildi",
                "Delivered" => "Teslim Edildi",
                "Cancelled" => "İptal Edildi",
                _ => newStatus
            };

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Sipariş Durumu Güncellendi</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: {statusColor}; text-align: center;'>{statusIcon} Sipariş Durumu Güncellendi</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Sipariş numarası <strong>{orderNumber}</strong> olan siparişinizin durumu güncellendi.</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {statusColor};'>
            <h3 style='margin-top: 0; color: #333;'>Durum Değişikliği</h3>
            <p><strong>Yeni Durum:</strong> <span style='color: {statusColor}; font-weight: bold;'>{statusText}</span></p>
            <p><strong>Güncelleme Tarihi:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</p>
        </div>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Commerce System Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private string GenerateOrderShippedEmailBody(string userName, string orderNumber, string shippingAddress)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Siparişiniz Kargoya Verildi</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #007bff; text-align: center;'>🚚 Siparişiniz Kargoya Verildi!</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Harika haber! Sipariş numarası <strong>{orderNumber}</strong> olan siparişiniz kargoya verildi.</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;'>
            <h3 style='margin-top: 0; color: #333;'>Kargo Bilgileri</h3>
            <p><strong>Teslimat Adresi:</strong></p>
            <p style='background-color: #f8f9fa; padding: 10px; border-radius: 3px;'>{shippingAddress}</p>
            <p><strong>Tahmini Teslimat:</strong> 1-3 iş günü</p>
        </div>
        
        <p>Kargo takip numaranız kısa süre içinde size gönderilecektir.</p>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Commerce System Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private string GenerateOrderDeliveredEmailBody(string userName, string orderNumber)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Siparişiniz Teslim Edildi</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #28a745; text-align: center;'>📦 Siparişiniz Teslim Edildi!</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Sipariş numarası <strong>{orderNumber}</strong> olan siparişiniz başarıyla teslim edilmiştir.</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;'>
            <h3 style='margin-top: 0; color: #333;'>Teslim Bilgileri</h3>
            <p><strong>Teslim Tarihi:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</p>
            <p><strong>Durum:</strong> <span style='color: #28a745; font-weight: bold;'>Teslim Edildi</span></p>
        </div>
        
        <p>Umarız ürünlerimizden memnun kalırsınız! Değerlendirmenizi bekliyoruz.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='#' style='background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;'>
                Ürünü Değerlendir
            </a>
            <a href='#' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Tekrar Alışveriş Yap
            </a>
        </div>
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
        
        <p style='font-size: 12px; color: #666; text-align: center;'>
            Commerce System Ekibi
        </p>
    </div>
</body>
</html>";
        }

        private string GenerateOrderCancelledEmailBody(string userName, string orderNumber, string reason)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Sipariş İptal Edildi</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 30px; border-radius: 10px;'>
        <h2 style='color: #dc3545; text-align: center;'>❌ Siparişiniz İptal Edildi</h2>
        
        <p>Merhaba <strong>{userName}</strong>,</p>
        
        <p>Maalesef sipariş numarası <strong>{orderNumber}</strong> olan siparişiniz iptal edilmiştir.</p>
        
        <div style='background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;'>
            <h3 style='margin-top: 0; color: #333;'>İptal Bilgileri</h3>
            <p><strong>İptal Nedeni:</strong> {reason}</p>
            <p><strong>İptal Tarihi:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</p>
        </div>
        
        <p>Ödemeniz varsa, 3-5 iş günü içinde hesabınıza iade edilecektir.</p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='#' style='background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Yeni Sipariş Ver
            </a>
        </div>
        
        <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
        
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
