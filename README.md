# Fokus - Kişisel Üretkenlik Uygulaması

Modern bir kişisel üretkenlik uygulaması. Not alma, görev yönetimi, Pomodoro zamanlayıcı ve haftalık planlama özellikleri.

## 🚀 Teknoloji Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

### DevOps
- Docker & Docker Compose
- Coolify Compatible
- Nginx (Production)

## ✨ Özellikler

### 📝 Not Yönetimi
- Başlık, içerik, etiketler ve tarih damgası ile kapsamlı not tutma
- Not sabitleme ve arama özellikleri
- Markdown desteği
- Tema uyumlu tasarım

### ✅ Görev Yönetimi
- Günlük to-do listesi ve durum takibi
- Görev düzenleme ve tamamlama özellikleri
- Öncelik seviyeleri
- Tarih bazlı filtreleme

### 📅 Haftalık Planlayıcı
- 7 günlük görünüm
- Görev planlama ve takip
- Drag & drop desteği (gelecek güncelleme)

### 🔍 Spotlight Arama
- **Ctrl+K** ile hızlı komut arayıcısı
- Sayfa navigasyonu ve hızlı eylemler
- Özelleştirilebilir komut sıralaması
- Arama geçmişi ve kullanım istatistikleri

### 🎨 Tema Sistemi
- Açık/Koyu/Sistem modu
- Gerçek zamanlı tema değişimi
- Tüm bileşenler için uyumlu renkler

## 📦 Kurulum

### Gereksinimler
- Node.js 20+
- Docker & Docker Compose (opsiyonel)
- PostgreSQL 16+ (Docker olmadan)

### 1. Docker ile Başlatma (Önerilen)

```bash
# Repository'yi klonla
git clone <repo-url>
cd fokus

# .env dosyasını oluştur
cp .env.example .env

# Docker ile başlat (tüm servisler)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# PostgreSQL: localhost:5432
```

### 2. Yerel Geliştirme (Docker olmadan)

```bash
# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasında DATABASE_URL'i güncelleyin

# Veritabanı migration
npx prisma migrate dev

# Backend'i başlat
npm run dev

# Frontend kurulumu (yeni terminal)
cd ..
npm install
npm run dev
```

## 🐳 Coolify Deployment

### Backend Deployment
1. Coolify'da yeni servis oluştur
2. Repository'yi bağla
3. Build Path: `backend`
4. Dockerfile: `backend/Dockerfile`
5. Environment Variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Güçlü bir secret key
   - `CORS_ORIGIN`: Frontend URL

### Frontend Deployment
1. Coolify'da yeni servis oluştur
2. Repository'yi bağla
3. Build Path: `.` (root)
4. Dockerfile: `Dockerfile`
5. Build Args:
   - `VITE_API_URL`: Backend API URL

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Kullanıcı bilgileri

### Notes
- `GET /api/notes` - Tüm notlar
- `POST /api/notes` - Not oluştur
- `PUT /api/notes/:id` - Not güncelle
- `DELETE /api/notes/:id` - Not sil

### Tasks
- `GET /api/tasks` - Tüm görevler
- `POST /api/tasks` - Görev oluştur
- `PUT /api/tasks/:id` - Görev güncelle
- `DELETE /api/tasks/:id` - Görev sil

### Task Lists
- `GET /api/task-lists` - Tüm listeler
- `POST /api/task-lists` - Liste oluştur

### Pomodoro
- `GET /api/pomodoro` - Tüm oturumlar
- `GET /api/pomodoro/stats` - İstatistikler
- `POST /api/pomodoro` - Oturum kaydet

## 📁 Proje Yapısı

```
fokus/
├── src/                    # Frontend kaynak kodu
│   ├── components/         # React bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   ├── hooks/              # Custom hooks
│   ├── services/           # API servisleri
│   └── lib/                # Utility fonksiyonları
├── backend/                # Backend kaynak kodu
│   ├── src/
│   │   ├── routes/         # API route'ları
│   │   ├── middleware/     # Express middleware
│   │   └── lib/            # Utility & Prisma
│   └── prisma/             # Prisma schema
├── public/                 # Statik dosyalar
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Frontend Dockerfile
└── nginx.conf              # Nginx config
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

### Docker Compose (.env)
```env
POSTGRES_USER=fokus
POSTGRES_PASSWORD=fokus_password
POSTGRES_DB=fokus_db
VITE_API_URL=http://localhost:3001/api
```

## 📝 Lisans

MIT License

**Fokus** ile üretkenliğinizi artırın! 🚀

*Son güncelleme: Aralık 2024*
