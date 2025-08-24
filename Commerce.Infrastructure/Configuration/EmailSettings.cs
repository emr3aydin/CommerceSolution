namespace Commerce.Infrastructure.Configuration
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public bool EnableSsl { get; set; }
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderPassword { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
    }
}
