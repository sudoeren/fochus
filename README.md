# Fokus 🎯

Fokus, işlerinizi organize etmenize ve üretkenliğinizi artırmanıza yardımcı olan minimalist bir uygulamadır. Notlarınızı tutun, görevlerinizi planlayın ve Pomodoro tekniği ile odaklanın.

## 🚀 Kurulum (Docker ile)

Bu uygulamayı bilgisayarınızda çalıştırmanın en kolay yolu Docker kullanmaktır.

### Gereksinimler
- Bilgisayarınızda **Docker** ve **Docker Compose** yüklü olmalıdır.

### Adım Adım Kurulum

1. **Projeyi İndirin**
   Bu dosyaları bilgisayarınızdaki bir klasöre indirin veya terminalden kopyalayın:
   ```bash
   git clone https://github.com/kullaniciadi/fochus.git
   cd fochus
   ```

2. **Uygulamayı Başlatın**
   Terminali proje klasöründe açın ve şu komutu çalıştırın:
   ```bash
   docker-compose up -d
   ```
   *(Bu işlem ilk seferde gerekli dosyaları indireceği için birkaç dakika sürebilir.)*

3. **Kullanmaya Başlayın**
   Kurulum tamamlandığında tarayıcınızı açın ve şu adrese gidin:
   
   👉 **http://localhost:3000**

## 🛠️ Özellikler

- **📝 Notlar**: Zengin metin editörü ile notlarınızı düzenleyin.
- **✅ Görevler**: Yapılacaklar listenizi oluşturun ve takip edin.
- **🍅 Odaklanma**: Pomodoro sayacı ile çalışma sürelerinizi yönetin.
- **📅 Planlayıcı**: Haftalık ve günlük planlarınızı yapın.
- **🌙 Karanlık Mod**: Göz yormayan arayüz seçeneği.

## 💻 Geliştirme Komutları

Eğer projeyi geliştirmek veya Docker dışında çalıştırmak isterseniz şu komutları kullanabilirsiniz:

### Veritabanı Kurulumu
Veritabanı şemasını güncellemek veya oluşturmak için:
```bash
cd backend
npm run db:push
```

### Veritabanı Arayüzü (Prisma Studio)
Veritabanı içeriğini tarayıcıdan görüntülemek ve düzenlemek için:
```bash
cd backend
npm run db:studio
```

### Geliştirme Modunda Çalıştırma
Frontend ve Backend'i ayrı ayrı çalıştırmak için:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

## ❓ Sıkça Sorulan Sorular

**Uygulamayı nasıl durdururum?**
Terminalde docker-compose down komutunu kullanabilirsiniz.

**Verilerim nerede saklanıyor?**
Tüm verileriniz kendi bilgisayarınızda (Docker içinde) güvenli bir şekilde saklanır.

---
*İyi çalışmalar!*
