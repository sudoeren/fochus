# Fochus: Kişisel Üretkenlik ve Odaklanma Asistanı

## 📌 Proje Hakkında
**Fochus**, modern çalışma hayatının getirdiği dikkat dağınıklığı ve organizasyon eksikliği problemlerine çözüm olarak geliştirilmiş, kapsamlı bir kişisel üretkenlik uygulamasıdır. Not alma, görev yönetimi ve odaklanma tekniklerini (Pomodoro) tek bir çatı altında toplayarak, kullanıcıların iş akışlarını bölmeden yönetmelerini sağlar.

Kullanıcı dostu arayüzü, göz yormayan karanlık/aydınlık mod seçenekleri ve hızlı erişim özellikleri (Spotlight) ile Fochus, sadece bir "yapılacaklar listesi" olmanın ötesinde, tam bir dijital çalışma alanıdır.

---

## 🚀 Öne Çıkan Özellikler

### 📝 1. Akıllı Not Yönetimi
Düşüncelerinizi kaybetmeyin. Fochus'un gelişmiş not alma modülü şunları sunar:
- **Zengin Metin Editörü:** Başlıklar, listeler, kalın/italik yazım gibi biçimlendirme seçenekleri.
- **Hızlı Erişim:** Önemli notları sabitleme (pin) özelliği.
- **Güvenli Silme:** Yanlışlıkla silinen notlar için "Çöp Kutusu" ve geri yükleme imkanı.
- **Entegre Yapı:** Notlarınızı görevlerinizle ilişkilendirebilme esnekliği.

### ✅ 2. Gelişmiş Görev Takibi (To-Do)
Projelerinizi ve günlük işlerinizi organize edin:
- **Kategorize Edilmiş Listeler:** "İş", "Kişisel", "Alışveriş" gibi özel listeler oluşturun.
- **Sürükle & Bırak:** Önceliklerinizi değiştirmek için görevleri sürükleyip bırakın (`@hello-pangea/dnd`).
- **Tekrarlayan Görevler:** Günlük, haftalık rutine binen işler için otomatik hatırlatıcılar.
- **Alt Görevler:** Büyük projeleri küçük, yönetilebilir parçalara bölün.

### ⏱️ 3. Pomodoro Odak Zamanlayıcısı
Verimliliğinizi bilimsel yöntemlerle artırın:
- **Özelleştirilebilir Süreler:** Çalışma (25dk), Kısa Mola (5dk), Uzun Mola (15dk) modları.
- **Oturum Takibi:** Günlük kaç oturum tamamladığınızı izleyin.
- **Minimalist Mod:** Çalışırken dikkatinizi dağıtacak tüm öğeleri gizleyen odak modu.

### 🔍 4. Spotlight Arama (`Ctrl + K`)
Uygulama içinde gezinmekle vakit kaybetmeyin. Spotlight özelliği ile:
- İstediğiniz nota veya göreve anında ulaşın.
- Ayarları değiştirin veya tema (Karanlık/Aydınlık) geçişi yapın.
- Tüm bunları klavyeden elinizi kaldırmadan yapın.

---

## 🛠️ Teknik Altyapı

Fochus, performans, güvenlik ve ölçeklenebilirlik gözetilerek modern web teknolojileriyle inşa edilmiştir.

### Frontend (Kullanıcı Arayüzü)
- **React 19 & Vite:** Işık hızında açılış süreleri ve reaktif kullanıcı deneyimi.
- **TypeScript:** Tip güvenli kod yapısı ile hatasız geliştirme süreci.
- **Tailwind CSS:** Modern, responsive ve özelleştirilebilir tasarım sistemi.
- **Lucide React:** Tutarlı ve şık ikon kütüphanesi.

### Backend (Sunucu ve API)
- **Node.js & Express:** Güçlü ve esnek RESTful API mimarisi.
- **Prisma ORM:** Veritabanı işlemleri için güvenli ve modern bir katman.
- **PostgreSQL:** Verilerin güvenle saklandığı ilişkisel veritabanı.
- **JWT & Bcrypt:** Güvenli kimlik doğrulama ve şifreleme standartları.
- **Zod:** Gelen verilerin doğruluğunu kontrol eden şema validasyonu.

### DevOps & Kurulum
- **Docker:** Tüm uygulamanın (Frontend, Backend, Veritabanı) tek komutla ayağa kaldırılmasını sağlayan konteyner yapısı.
- **Nginx:** Yüksek performanslı sunucu yapılandırması.

---

## 🏁 Kurulum ve Başlangıç

Fochus'u kendi bilgisayarınızda çalıştırmak için Docker kullanmanız önerilir.

1.  **Projeyi İndirin:**
    ```bash
    git clone https://github.com/kullaniciadi/fochus.git
    ```
2.  **Ayarları Yapın:**
    `.env.example` dosyalarını `.env` olarak kopyalayıp gerekli alanları doldurun.
3.  **Başlatın:**
    ```bash
    docker-compose up -d --build
    ```
    Uygulamanız `http://localhost:5173` adresinde hazır!

---

> *Fochus, Eren Çakar tarafından geliştirilmiştir.*
