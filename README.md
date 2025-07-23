# Fokus - Kişisel Üretkenlik Uygulaması

Fokus, not alma, günlük görev takibi ve haftalık planlama için geliştirilmiş minimalist bir masaüstü uygulamasıdır. Hızlı, çevrimdışı çalışan ve kullanıcı dostu bir deneyim sunar.

## ✨ Özellikler

### 📝 Notlar
- Başlık ve içerik alanı
- Etiket sistemi
- Tarih damgası
- Arama ve filtreleme
- Oluşturma, düzenleme ve silme

### ✅ Görev Yönetimi
- Günlük to-do listesi
- Görev durumları: Bekliyor, Tamamlandı, Ertelendi
- Hızlı görev ekleme
- Görev düzenleme ve silme

### 📅 Haftalık Planlayıcı
- 7 günlük görünüm
- Gün bazlı görev listeleri
- Haftalık özet ve istatistikler
- Sürükle-bırak sıralama (gelecek sürüm)

### 🎨 Tema ve Görünüm
- Açık ve koyu mod desteği
- Sistem teması takibi
- Minimalist tasarım
- Türkçe dil desteği

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
- `Ctrl+F` - Arama
- `Ctrl+,` - Ayarlar
- `F11` - Tam ekran
- `F12` - Geliştirici araçları

## 🔧 Geliştirme

### Katkıda Bulunma
1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

### Hata Raporlama
Hataları Issues sekmesinden rapor edebilirsiniz.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🎯 Gelecek Özellikler (Roadmap)

- [ ] Bildirim sistemi
- [ ] Veri import/export
- [ ] Markdown not desteği
- [ ] Sürükle-bırak görev sıralama
- [ ] Görev kategorileri
- [ ] Klavye kısayolları kişiselleştirme
- [ ] Otomatik yedekleme

---

**Fokus** ile üretkenliğinizi artırın! 🚀
