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

### Backend Kurulumu

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/your-username/CommerceSolution.git
   cd CommerceSolution
   ```

2. **Dependencies yükleyin:**
   ```bash
   dotnet restore
   ```

3. **Veritabanını oluşturun:**
   ```bash
   cd Commerce.Infrastructure
   dotnet ef database update --startup-project ../Commerce.API/Commerce.API.csproj
   ```

### Frontend Kurulumu

1. **Frontend dizinine gidin:**
   ```bash
   cd Commerce.Frontend/frontend
   ```

2. **Dependencies yükleyin:**
   ```bash
   npm install
   ```

## 🔧 Yapılandırma

### Backend Yapılandırması

`Commerce.API/appsettings.json` dosyasını düzenleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CommerceDB;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "YourVerySecureSecretKeyHere",
    "Issuer": "Commerce.API",
    "Audience": "Commerce.Frontend",
    "ExpirationInMinutes": 60
  },
  "EmailSettings": {
    "SmtpServer": "your-smtp-server",
    "Port": 587,
    "Username": "your-email",
    "Password": "your-password",
    "EnableSsl": true
  }
}
```

### Frontend Yapılandırması

`Commerce.Frontend/frontend/.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=https://localhost:7000
NEXT_PUBLIC_APP_NAME=Commerce Solution
```

## 🏃‍♂️ Çalıştırma

### Backend'i Çalıştırma

```bash
# Ana dizinde
dotnet run --project Commerce.API/Commerce.API.csproj

# Veya VS Code ile
# Ctrl+Shift+P > Tasks: Run Task > Run Backend API
```

Backend şu adreste çalışacaktır: `https://localhost:7000`

### Frontend'i Çalıştırma

```bash
cd Commerce.Frontend/frontend
npm run dev
```

Frontend şu adreste çalışacaktır: `http://localhost:3000`

## 📚 API Dökümanları

API çalıştığında Swagger UI şu adreste erişilebilir:
- **Swagger UI**: `https://localhost:7000/swagger`
- **OpenAPI JSON**: `https://localhost:7000/swagger/v1/swagger.json`

### Ana Endpoint'ler

#### 🔐 Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `POST /api/auth/verify-email` - Email doğrulama
- `POST /api/auth/refresh-token` - Token yenileme

#### 👤 Users
- `GET /api/users/current` - Mevcut kullanıcı bilgileri
- `PUT /api/users/profile` - Profil güncelleme
- `POST /api/users/change-password` - Şifre değiştirme

#### 🛍️ Products
- `GET /api/products` - Tüm ürünler
- `GET /api/products/{id}` - Ürün detayı
- `GET /api/products/category/{categoryId}` - Kategoriye göre ürünler

#### 🛒 Carts
- `GET /api/carts/user/{userId}` - Kullanıcı sepeti
- `POST /api/carts/add` - Sepete ürün ekleme
- `DELETE /api/carts/remove` - Sepetten ürün çıkarma

#### 📦 Orders
- `GET /api/orders` - Kullanıcı siparişleri
- `POST /api/orders` - Sipariş oluşturma
- `GET /api/orders/{id}` - Sipariş detayı

## 🧪 Testing

### Unit Testler
```bash
dotnet test
```

### Integration Testler
```bash
dotnet test --filter Category=Integration
```

### Frontend Testler
```bash
cd Commerce.Frontend/frontend
npm test
```

## 📝 Özellikler

### ✅ Tamamlanan Özellikler

- [x] Kullanıcı kaydı ve email doğrulama
- [x] JWT tabanlı authentication
- [x] Profil yönetimi ve şifre değiştirme
- [x] Ürün listeleme ve kategorilere göre filtreleme
- [x] Sepet yönetimi (ekleme, çıkarma, temizleme)
- [x] Sipariş oluşturma ve takip
- [x] Responsive frontend tasarımı
- [x] Real-time navbar güncelleme
- [x] Global exception handling
- [x] Validation ve error handling
- [x] Clean Architecture implementation

### 🚧 Geliştirme Aşamasında

- [ ] Payment integration
- [ ] Advanced search ve filtering
- [ ] Product reviews ve ratings
- [ ] Wish list functionality
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] File upload (product images)
- [ ] Caching implementation
- [ ] API rate limiting

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Geliştirme Kuralları

- **Clean Architecture** prensiplerine uyun
- **SOLID** prensiplerine dikkat edin
- Unit testler yazın
- Kod dokumentasyonu ekleyin
- Git commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) kullanın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Emre Aydın**
- GitHub: [@emreaydin-dev](https://github.com/emreaydin-dev)
- LinkedIn: [Emre Aydın](https://linkedin.com/in/emreaydin-dev)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!