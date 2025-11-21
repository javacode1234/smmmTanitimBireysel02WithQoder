# SMMM Yönetim Sistemi

Serbest Muhasebeci Mali Müşavir (SMMM) tanıtım, müşteri yönetim ve takip sistemi. Next.js 14 (App Router) ve çoklu veritabanı desteği (SQLite, MySQL, PostgreSQL) ile geliştirilmiştir.

## 🚀 Teknolojiler

- **Frontend:** Next.js 14, React 18, TailwindCSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** SQLite (development), MySQL (local production), PostgreSQL (Vercel)
- **ORM:** Prisma
- **Auth:** NextAuth.js (JWT + Role-based)
- **UI Components:** shadcn/ui
- **Charts:** Recharts (yakında eklenecek)
- **PDF:** jsPDF
- **Icons:** Lucide-react
- **Email:** Nodemailer

## 📁 Proje Yapısı

```
smmm-system/
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing page
│   │   ├── admin/             # Admin dashboard
│   │   ├── client/            # Müşteri dashboard
│   │   ├── auth/              # Authentication pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── landing/           # Landing page components
│   │   ├── admin/             # Admin components
│   │   └── client/            # Client components
│   ├── lib/                   # Utilities
│   └── prisma/                # Prisma schema
├── .env                       # Environment variables
├── .env.development           # Development environment (SQLite)
├── .env.production            # Production environment (MySQL)
├── .env.vercel                # Vercel environment (PostgreSQL)
└── package.json
```

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanı Ayarları

#### Development (SQLite - Yerel Geliştirme)
`.env.development` dosyası otomatik olarak SQLite kullanacak şekilde yapılandırılmıştır.

#### Local Production (MySQL)
`.env.production` dosyasını düzenleyin ve MySQL bağlantı bilgilerinizi girin:

```env
DATABASE_URL="mysql://kullanici:sifre@localhost:3306/smmm_system"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

#### Vercel Deployment (PostgreSQL)
Vercel dashboard üzerinden PostgreSQL veritabanı bağlantısı yapılandırması yapılmalıdır.

### 3. Prisma Migrations

#### Development için:
```bash
npm run db:init:dev
```

Bu komut otomatik olarak:
1. SQLite için uygun şemaya geçiş yapar
2. Gerekli migrasyonları çalıştırır
3. Veritabanını seed eder

#### Diğer ortamlar için:
```bash
npm run db:migrate
```

Bu komut otomatik olarak:
1. Ortama uygun şemaya geçiş yapar (MySQL/PostgreSQL)
2. Gerekli migrasyonları çalıştırır

#### Manuel şema değiştirme:
```bash
npm run db:switch-schema
```

### 4. Veritabanını Seed Edin (Opsiyonel)

İlk admin kullanıcısı oluşturmak için bir seed script'i ekleyebilirsiniz.

### 5. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📋 Özellikler

### Landing Page (Tanıtım Sayfası)
- ✅ Navbar with logo and menu
- ✅ Hero section with CTA
- ✅ Services section
- ✅ Contact form
- ✅ Footer
- ⏳ Clients carousel (yakında)
- ⏳ About us section (yakında)
- ⏳ Workflow section (yakında)
- ⏳ Pricing section (yakında)
- ⏳ Testimonials (yakında)
- ⏳ Team section (yakında)

### Authentication
- ✅ Sign in page
- ⏳ Role-based authentication (ADMIN/CLIENT)
- ⏳ Password reset
- ⏳ Email verification

### Admin Dashboard
- ✅ Dashboard overview
- ✅ Layout with sidebar navigation
- ⏳ Content Management (CMS for landing page)
- ⏳ Customer Management
- ⏳ Declaration Management
- ⏳ Announcements/Reminders
- ⏳ Collections & Account Tracking
- ⏳ Settings

### Client Dashboard
- ✅ Dashboard overview
- ✅ Layout with sidebar navigation
- ⏳ Profile management
- ⏳ View declarations (PDF)
- ⏳ Announcements
- ⏳ Account summary
- ⏳ Contact admin

## 🗃️ Database Schema

Prisma schema'da tanımlı modeller:

- **User:** Kullanıcı bilgileri ve authentication
- **Client:** Müşteri detayları
- **Declaration:** Beyanname belgелері
- **Announcement:** Duyurular
- **Reminder:** Hatırlatmalar
- **Collection:** Tahsilat kayıtları
- **ContentSection:** Landing page içerik yönetimi
- **Message:** Müşteri-admin mesajlaşma
- **Settings:** Sistem ayarları

## 🔐 Roller

- **ADMIN:** Tüm sistem yönetimi
- **CLIENT:** Sadece kendi verilerini görüntüleme

## 📝 Sonraki Adımlar

1. ✅ Proje yapısı ve temel sayfa lerarını oluştur
2. ✅ Landing page component'lerini tamamla
3. ✅ Admin ve Client dashboard layout'ları
4. ⏳ API route'ları geliştir
5. ⏳ CRUD işlemlerini ekle
6. ⏳ File upload sistemi (PDF)
7. ⏳ Email gönderimi
8. ⏳ Chart'ları ekle
9. ⏳ PDF export fonksiyonları
10. ⏳ Dark mode toggle

## 🤝 Katkıda Bulunma

Bu proje aktif geliştirme aşamasındadır. Önerilerinizi ve katkılarınızı bekliyoruz!

## 📄 Lisans

MIT License