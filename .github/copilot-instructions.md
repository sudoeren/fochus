<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Fokus Uygulaması Geliştirme Talimatları

Bu proje, Electron.js + React + TypeScript + Tailwind CSS + Prisma teknolojileri kullanılarak geliştirilmiş bir kişisel üretkenlik uygulamasıdır.

## Teknoloji Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron.js 
- **Veritabanı**: SQLite + Prisma ORM
- **Build**: Vite + Electron Builder
- **İkonlar**: Lucide React

## Proje Yapısı
- `src/` - React frontend kodu
- `electron/` - Electron main process kodu
- `prisma/` - Veritabanı şeması ve migrations
- `dist-renderer/` - Build edilmiş React kodu
- `dist-electron/` - Build edilmiş Electron kodu

## Özellikler
1. **Notlar**: Başlık, içerik, etiketler ve tarih damgası
2. **Görev Yönetimi**: Günlük to-do listesi, durum takibi
3. **Haftalık Planlayıcı**: 7 günlük görünüm ve görev planlama
4. **Tema Sistemi**: Açık/koyu/sistem modu
5. **Çevrimdışı Çalışma**: SQLite veritabanı

## Geliştirme Komutları
- `npm run dev` - Development sunucusu (React + Electron)
- `npm run build` - Production build
- `npm run db:push` - Veritabanı şemasını sync et
- `npm run db:generate` - Prisma client oluştur

## Tasarım Kuralları
- Minimalist ve temiz arayüz
- Türkçe dil desteği
- Responsive tasarım (mobil uyumlu değil, masaüstü odaklı)
- Tailwind CSS utility classes kullan
- Dark/Light mod uyumlu renkler
