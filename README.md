# Fokus - Kişisel Üretkenlik Uygulaması

Electron.js + React + TypeScript + Tailwind CSS + Prisma teknolojileri kullanılarak geliştirilmiş modern bir masaüstü üretkenlik uygulaması.

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

### 📱 Responsive Tasarım
- **Mobile-first** yaklaşım
- Telefon, tablet ve masaüstü uyumlu
- Responsive sidebar navigasyon
- Touch-friendly arayüz

### 💾 Çevrimdışı Çalışma
- SQLite veritabanı
- Yerel veri depolama
- Hızlı performans
- İstatistik kartları ve ilerleme takibi

### 🔍 Spotlight Arama
- Ctrl+K ile hızlı arama ve komut çalıştırma
- Navigasyon kısayolları
- Hızlı görev ve not oluşturma
- Özelleştirilebilir komut sıralaması
- Akıllı filtreleme ve öneriler

### 📅 Haftalık Planlayıcı
- 7 günlük detaylı görünüm
- Gün bazlı görev organizasyonu
- Haftalık özet ve analytics
- İlerleme çubukları
- Geçmiş hafta karşılaştırmaları

### 🎨 Arayüz ve Tema
- Açık, koyu ve sistem modu desteği
- Tailwind CSS ile modern tasarım
- Responsive layout (masaüstü odaklı)
- Lucide React ikonları
- Türkçe dil desteği
- Minimalist ve temiz arayüz

## 🛠️ Teknolojiler

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop Framework**: Electron.js
- **Veritabanı**: SQLite + Prisma ORM
- **Build Tool**: Vite
- **İkonlar**: Lucide React
- **Paketleme**: Electron Builder

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Geliştirme Ortamı

1. **Bağımlılıkları kur:**
   ```bash
   npm install
   ```

2. **Veritabanını hazırla:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

3. **Geliştirme sunucusunu başlat:**
   ```bash
   npm run dev
   ```

## 📦 Build ve Dağıtım

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build:app
```

Bu komut `dist-app/` klasöründe platform-specific kurulum dosyaları oluşturur.

## 🗄️ Veritabanı

Uygulama SQLite veritabanı kullanır ve tamamen çevrimdışı çalışır. Veritabanı dosyası (`fokus.db`) proje klasöründe saklanır.

### Veritabanı Komutları
```bash
# Şemayı sync et
npm run db:push

# Prisma client oluştur
npm run db:generate  

# Veritabanı studio aç
npm run db:studio
```

## 📂 Proje Yapısı

```
fokus/
├── src/                 # React frontend kodu
│   ├── components/      # React bileşenleri
│   ├── pages/          # Sayfa bileşenleri
│   ├── types.ts        # TypeScript tanımları
│   └── index.css       # Global stiller
├── electron/           # Electron main process
│   ├── main.ts         # Ana Electron dosyası
│   ├── preload.ts      # Preload script
│   └── utils.ts        # Yardımcı fonksiyonlar
├── prisma/             # Veritabanı şeması
│   └── schema.prisma   # Prisma şema dosyası
├── dist-renderer/      # Build edilmiş React
├── dist-electron/      # Build edilmiş Electron
└── dist-app/          # Dağıtım dosyaları
```

## 🖥️ Ekranlar

1. **Ana Sayfa (Dashboard)** - Günün özeti ve hızlı erişim
2. **Notlar** - Not listesi ve detay görünümü
3. **Günlük Görevler** - To-do liste yönetimi
4. **Haftalık Planlayıcı** - 7 günlük görünüm
5. **Ayarlar** - Tema ve veri yönetimi

## ⌨️ Klavye Kısayolları

- `Ctrl+N` - Yeni not
- `Ctrl+T` - Yeni görev
## ⌨️ Klavye Kısayolları

### Genel
- `Ctrl+K` - Spotlight açık/kapat
- `Ctrl+N` - Yeni not oluştur
- `Ctrl+T` - Yeni görev oluştur
- `Ctrl+,` - Ayarlar sayfası
- `F11` - Tam ekran
- `F12` - Geliştirici araçları

### Spotlight İçinde
- `↑` / `↓` - Yukarı/aşağı hareket
- `Enter` - Seçili öğeyi aç/çalıştır
- `Esc` - Spotlight'ı kapat

### Görev Yönetimi
- `Space` - Görev durumunu değiştir
- `Delete` - Görevi sil
- `Ctrl+P` - Görevi sabitle/sabitlemeyi kaldır

## 🎯 Gelecek Özellikler

- [ ] Görevler arası bağımlılık
- [ ] Pomodoro timer entegrasyonu
- [ ] Export/import fonksiyonları
- [ ] Kategori bazlı raporlama
- [ ] Widget modu
- [ ] Bulut senkronizasyonu (isteğe bağlı)
- [ ] Markdown not desteği
- [ ] Klavye kısayolları kişiselleştirme
- [ ] Otomatik yedekleme
- [ ] Bildirim sistemi

## 🔧 Geliştirme

### Katkıda Bulunma
1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

### Hata Raporlama
Hataları Issues sekmesinden rapor edebilirsiniz.

## � Bilinen Sorunlar

Şu anda bilinen kritik sorun bulunmamaktadır. Sorun yaşarsanız GitHub Issues bölümünden bildirebilirsiniz.

## �📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 👤 Geliştirici

Fokus, kişisel üretkenliği artırmak için modern teknolojilerle geliştirilmiş bir uygulamadır.

---

**Fokus** ile üretkenliğinizi artırın! 🚀

*Son güncelleme: Aralık 2024*
