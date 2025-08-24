# 🛒 Commerce Solution

**Modern ve ölçeklenebilir bir e-ticaret sistemi - Clean Architecture ile geliştirilmiştir.**

## 📋 İçindekiler

- [📖 Proje Hakkında](#-proje-hakkında)
- [🏗️ Mimari](#️-mimari)
- [🚀 Teknolojiler](#-teknolojiler)
- [📁 Proje Yapısı](#-proje-yapısı)
- [⚙️ Kurulum](#️-kurulum)
- [🔧 Yapılandırma](#-yapılandırma)
- [🏃‍♂️ Çalıştırma](#️-çalıştırma)
- [📚 API Dökümanları](#-api-dökümanları)
- [🧪 Testing](#-testing)
- [📝 Özellikler](#-özellikler)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)

## 📖 Proje Hakkında

Commerce Solution, modern web teknolojileri kullanılarak geliştirilmiş tam kapsamlı bir e-ticaret platformudur. Clean Architecture prensiplerine uygun olarak tasarlanmış, ölçeklenebilir ve sürdürülebilir bir yapıya sahiptir.

### ✨ Temel Özellikler

- 🔐 **Güvenli Kimlik Doğrulama**: JWT tabanlı authentication ve authorization
- 📧 **Email Doğrulama**: Yeni kullanıcılar için otomatik email verification
- 🛍️ **Sepet Yönetimi**: Gelişmiş sepet işlemleri ve stok kontrolü
- 📦 **Sipariş Takibi**: Detaylı sipariş yönetimi ve durum takibi
- 👤 **Profil Yönetimi**: Kullanıcı bilgileri güncelleme ve şifre değiştirme
- 📱 **Responsive Tasarım**: Tüm cihazlarla uyumlu modern UI
- 🔍 **Gelişmiş Arama**: Kategori ve ürün filtreleme
- 📊 **Admin Paneli**: Kapsamlı yönetim araçları

## 🏗️ Mimari

Proje **Clean Architecture** prensiplerine uygun olarak tasarlanmıştır:

```
🏛️ Domain Layer (Commerce.Domain)
├── Entities (Varlıklar)
├── Value Objects
└── Domain Events

🧩 Core Layer (Commerce.Core)
├── Common (Ortak sınıflar)
├── Constants (Sabitler)
└── Exceptions (Özel hatalar)

🏢 Application Layer (Commerce.Application)
├── Features (CQRS Pattern)
│   ├── Commands
│   ├── Queries
│   └── Handlers
├── Behaviors (MediatR Behaviors)
└── DTOs

🔧 Infrastructure Layer (Commerce.Infrastructure)
├── Persistence (Veritabanı)
├── Services (Harici servisler)
└── Interfaces

🎯 Presentation Layer (Commerce.API)
├── Controllers
├── Middlewares
└── Configuration

🖥️ Frontend (Commerce.Frontend)
├── Next.js App
├── Components
└── Services
```

## 🚀 Teknolojiler

### Backend
- **Framework**: ASP.NET Core 9.0
- **ORM**: Entity Framework Core
- **Database**: SQL Server
- **Architecture**: Clean Architecture + CQRS
- **Authentication**: JWT + ASP.NET Identity
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: HeroUI (NextUI)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **HTTP Client**: Custom API layer

## 📁 Proje Yapısı

```
📂 CommerceSolution/
├── 🎯 Commerce.API/                 # Web API katmanı
│   ├── Controllers/                # API kontrolcüleri
│   ├── Handlers/                   # Global exception handlers
│   └── Properties/                 # Launch settings
├── 🏢 Commerce.Application/         # Uygulama katmanı
│   ├── Features/                   # CQRS features
│   │   ├── Users/                 # Kullanıcı işlemleri
│   │   ├── Products/              # Ürün işlemleri
│   │   ├── Orders/                # Sipariş işlemleri
│   │   ├── Carts/                 # Sepet işlemleri
│   │   └── Categories/            # Kategori işlemleri
│   ├── Behaviors/                 # MediatR behaviors
│   └── Common/                    # Ortak sınıflar
├── 🧩 Commerce.Core/                # Çekirdek katman
│   ├── Common/                    # Ortak API responses
│   ├── Constants/                 # Uygulama sabitleri
│   └── Exceptions/                # Özel exception'lar
├── 🏛️ Commerce.Domain/              # Domain katmanı
│   └── Entities/                  # Domain entities
├── 🔧 Commerce.Infrastructure/      # Altyapı katmanı
│   ├── Persistence/               # Veritabanı context
│   ├── Services/                  # Harici servisler
│   ├── Interfaces/                # Servis arayüzleri
│   └── Migrations/                # EF migrations
└── 🖥️ Commerce.Frontend/            # Frontend uygulaması
    └── frontend/                  # Next.js app
        ├── app/                   # App router pages
        ├── components/            # React components
        ├── lib/                   # Utility libraries
        └── public/                # Statik dosyalar
```

## ⚙️ Kurulum

### Ön Gereksinimler

- ✅ .NET 9.0 SDK
- ✅ Node.js 18+ ve npm
- ✅ SQL Server (LocalDB veya tam sürüm)
- ✅ Git

### Hızlı Başlangıç (Otomatik Migration’lı)

1. Repository’yi klonlayın
   ```bash
   git clone https://github.com/your-username/CommerceSolution.git
   cd CommerceSolution
   ```

2. Backend bağımlılıklarını yükleyin
   ```bash
   dotnet restore
   ```

3. HTTPS dev sertifikasını güvenilir yapın (ilk kez)
   ```bash
   dotnet dev-certs https --trust
   ```

4. appsettings.json bağlantı dizesini kontrol edin
   - `Commerce.API/appsettings.json > ConnectionStrings:DefaultConnection` yeni makineye uygun olmalı.
   - Örnek: `(localdb)\\MSSQLLocalDB;Database=CommerceDB;Trusted_Connection=True;Encrypt=False`

5. Backend’i çalıştırın (ilk çalıştırmada DB migration’ları otomatik uygulanır)
   ```bash
   dotnet run --project Commerce.API/Commerce.API.csproj --launch-profile https
   ```

6. Frontend’i çalıştırın
   ```bash
   cd Commerce.Frontend/frontend
   npm install
   # .env.local dosyasında API URL’ini kontrol edin
   npm run dev
   ```

> Not: Program.cs içinde ApplicationDbContext ve LogDbContext için `Database.Migrate()` çağrıları eklendi. Bu sayede ilk çalıştırmada veritabanı şeması otomatik oluşturulur/güncellenir.

### Frontend Ortam Değişkenleri

`Commerce.Frontend/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://localhost:7057
NODE_ENV=development
```

## 🔧 Yapılandırma

### Backend Yapılandırması (Özet)

`Commerce.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=CommerceDB;Trusted_Connection=True;Encrypt=False"
  },
  "Jwt": {
    "Issuer": "https://localhost:7057",
    "Audience": "https://localhost:7057",
    "Key": "thisisasecretkeythatshouldbeverylongandsecure"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.mailersend.net",
    "SmtpPort": 587,
    "SenderEmail": "<mailer-send-smtp-user@example.com>",
    "SenderPassword": "<smtp-password-or-api-key>",
    "SenderName": "Commerce API",
    "EnableSsl": true
  }
}
```

### Email Servisi (SMTP) Kurulumu

- Email gönderimleri `Commerce.Infrastructure.Services.EmailService` ile yapılır ve `EmailSettings` config bölümünden beslenir.
- Her SMTP sağlayıcıyla uyumludur (MailerSend, SendGrid SMTP relay, Gmail SMTP vb.). Aşağıda MailerSend örneği verilmiştir.

Adımlar:
1. SMTP sağlayıcınızdan host, port, kullanıcı (genelde gönderen email) ve parola/API Key alın.
2. `Commerce.API/appsettings.json > EmailSettings` alanını doldurun.
3. Geliştirmede TLS/SSL için `EnableSsl: true` ve port 587 (STARTTLS) genelde yeterlidir.

Örnek (MailerSend):
```json
"EmailSettings": {
  "SmtpServer": "smtp.mailersend.net",
  "SmtpPort": 587,
  "SenderEmail": "MS_xxx@test-xxxxxx.mlsender.net",
  "SenderPassword": "mssp.xxxxxx.yyyyy",
  "SenderName": "Commerce API",
  "EnableSsl": true
}
```

Notlar ve İpuçları:
- SenderEmail, sağlayıcının tanıttığı domain/e-posta ile eşleşmelidir (SPF/DKIM ayarlı olmalı).
- Geliştirme ortamında bazı kurum ağlarında SMTP portları engelli olabilir; farklı ağ veya sağlayıcı deneyin.
- Hata durumlarını backend loglarında görebilirsiniz (EmailService, ILogger ile ayrıntı loglar yazıyor).
- Üretimde sırları appsettings yerine kullanıcı sır yöneticilerinde (User Secrets/Azure Key Vault) tutun.

## 🏃‍♂️ Çalıştırma

### Backend
- Task: VS Code > Tasks: Run Task > Run Backend API
- Manuel: `dotnet run --project Commerce.API/Commerce.API.csproj --launch-profile https`
- Swagger: `https://localhost:7057/swagger`

### Frontend
- `cd Commerce.Frontend/frontend && npm run dev`
- `http://localhost:3000`

## 📚 API Dökümanları
- Swagger UI: `https://localhost:7057/swagger`
- OpenAPI JSON: `https://localhost:7057/swagger/v1/swagger.json`

## Bilinen Notlar
- Kimlik doğrulama JWT Bearer’dır (cookie değil). Authorization: Bearer <token> başlığı zorunlu.
- İlk giriş için email doğrulaması gereklidir (Identity RequireConfirmedEmail = true).
- CORS: 3000/3001 (http/https) izinli.

---

Herhangi bir sorun için Issues kısmından bildirebilirsiniz.